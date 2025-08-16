"use server";

import { getUser } from "@/lib/data";
import { parseMessages, parsePaymentMessage } from "@/lib/gmail";
import { getGmailClient } from "@/lib/gmail/client";
import {
	UtilityBill as Bill,
	EmailContent,
	Tenant,
	UtilityProvider,
	UtilityProviderCategory,
} from "@/types";

export const fetchUserBills = async (
	providers: UtilityProvider[],
	month: number,
	year: number,
): Promise<Bill[]> => {
	try {
		const loggedInUser = await getUser();
		if (!loggedInUser.accessToken) {
			throw new Error("User is not logged in");
		}
		const gmailClient = getGmailClient(loggedInUser.accessToken);
		const bills: Bill[] = [];

		for (const provider of providers) {
			// Calculate the first day of the next month
			const nextMonthDate = new Date(year, month, 1);
			const query = `${provider.name} after:${year}-${month}-01 before:${nextMonthDate.getFullYear()}-${nextMonthDate.getMonth() + 1}-01`;

			const response = await gmailClient.users.messages.list({
				userId: "me",
				q: query,
			});

			const messages = response.data.messages || [];
			if (messages.length === 0) {
				bills.push({
					id: null,
					gmailMessageId: "",
					utilityProvider: provider,
					amount: 0,
					month,
					year,
				});
				continue;
			}

			const billDetails = await parseMessages(
				gmailClient,
				messages,
				provider.name,
			);

			bills.push({
				id: null, // Assuming id is generated later or not needed immediately
				utilityProvider: provider,
				gmailMessageId: billDetails.map((detail) => detail.messageId).join(","),
				amount: billDetails.reduce(
					(total, detail) => total + detail.dollarAmount,
					0,
				),
				month,
				year,
			});
		}
		// Manually adding water bill integration is in place for now
		bills.push({
			id: null,
			gmailMessageId: "manually-added",
			utilityProvider: {
				id: null,
				userId: loggedInUser.id,
				name: "Manually Added",
				category: UtilityProviderCategory.Water,
			},
			amount: 440.25,
			month,
			year,
		});
		return bills;
	} catch (error) {
		console.error("Error fetching bills:", error);
		throw new Error("Failed to fetch bills");
	}
};

export const sendEmail = async (emailContent: EmailContent, tenant: Tenant) => {
	try {
		const loggedInUser = await getUser();
		if (!loggedInUser.accessToken) {
			throw new Error("User is not logged in");
		}
		const gmailClient = getGmailClient(loggedInUser.accessToken);

		const email = {
			to: tenant.email,
			subject: emailContent.subject,
			body: emailContent.body,
			attachments: emailContent.attachments || [],
		};

		const rawEmail = [
			`To: ${email.to}`,
			`Subject: ${email.subject}`,
			`Content-Type: text/html; charset="UTF-8"`,
			"",
			email.body,
		].join("\r\n");

		const result = await gmailClient.users.messages.send({
			userId: "me",
			requestBody: {
				raw: btoa(rawEmail), // Base64 encode the email content
			},
		});

		return result.status === 200
			? { success: true, messageId: result.data.id }
			: { success: false, error: "Failed to send email" };
	} catch (error) {
		console.error("Error sending email:", error);
		throw new Error("Failed to send email");
	}
};

export const queryForBillPayment = async (
	tenant: Tenant,
	dateRange = { start: "", end: "" },
) => {
	try {
		const loggedInUser = await getUser();
		if (!loggedInUser.accessToken) {
			throw new Error("User is not logged in");
		}
		const gmailClient = getGmailClient(loggedInUser.accessToken);

		const query = `from:${tenant.name} after:${dateRange.start} before:${dateRange.end}`;
		const response = await gmailClient.users.messages.list({
			userId: "me",
			q: query,
		});

		const messages = response.data.messages || [];
		if (messages.length === 0) {
			return null;
		}

		return await parsePaymentMessage(gmailClient, messages);
	} catch (error) {
		console.error("Error querying for bill payment:", error);
		throw new Error("Failed to query for bill payment");
	}
};
