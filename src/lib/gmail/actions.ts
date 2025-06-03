"use server";

import { getUser } from "@/lib/data";
import { parseMessages } from "@/lib/gmail-utils";
import { getGmailClient } from "@/lib/gmail-utils/client";
import {
	UtilityBill as Bill,
	EmailContent,
	Tenant,
	UtilityProvider,
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
			const query = `${provider.name} after:${year}-${month}-01 before:${year}-${month + 1}-01`;

			const response = await gmailClient.users.messages.list({
				userId: "me",
				q: query,
			});

			const messages = response.data.messages || [];
			if (messages.length === 0) {
				bills.push({
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
