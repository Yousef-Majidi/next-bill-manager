"use server";

import { safeExecuteAsync } from "@/lib/common/error-handling";
import { isObjectType } from "@/lib/common/type-utils";
import { getTenantShares, roundToCurrency } from "@/lib/common/utils";
import { getUser, markBillAsPaid, updateTenantBalance } from "@/lib/data";
import { parseMessages, parsePaymentMessage } from "@/lib/gmail";
import { getGmailClient } from "@/lib/gmail/client";
import {
	UtilityBill as Bill,
	ConsolidatedBill,
	EmailContent,
	Payment,
	Tenant,
	UtilityProvider,
} from "@/types";

export const fetchUserBills = async (
	providers: UtilityProvider[],
	month: number,
	year: number,
): Promise<Bill[]> => {
	const result = await safeExecuteAsync(async () => {
		const loggedInUser = await getUser();
		if (!isObjectType(loggedInUser) || !loggedInUser.accessToken) {
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
		return bills;
	});

	if (!result.success) {
		console.error("Error fetching bills:", result.error);
		throw new Error("Failed to fetch bills");
	}

	return result.data;
};

export const sendEmail = async (emailContent: EmailContent, tenant: Tenant) => {
	const result = await safeExecuteAsync(async () => {
		const loggedInUser = await getUser();
		if (!isObjectType(loggedInUser) || !loggedInUser.accessToken) {
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

		const gmailResult = await gmailClient.users.messages.send({
			userId: "me",
			requestBody: {
				raw: btoa(rawEmail), // Base64 encode the email content
			},
		});

		return gmailResult.status === 200
			? { success: true, messageId: gmailResult.data.id }
			: { success: false, error: "Failed to send email" };
	});

	if (!result.success) {
		console.error("Error sending email:", result.error);
		throw new Error("Failed to send email");
	}

	return result.data;
};

export const queryForBillPayment = async (
	tenant: Tenant,
	dateRange = { start: "", end: "" },
) => {
	const result = await safeExecuteAsync(async () => {
		const loggedInUser = await getUser();
		if (!isObjectType(loggedInUser) || !loggedInUser.accessToken) {
			throw new Error("User is not logged in");
		}
		const gmailClient = getGmailClient(loggedInUser.accessToken);

		// Search for payments from either primary name or secondary name
		const searchNames = [tenant.name];
		if (tenant.secondaryName) {
			searchNames.push(tenant.secondaryName);
		}

		// Try each name in the search
		for (const name of searchNames) {
			const query = `from:"${name}" after:${dateRange.start} before:${dateRange.end}`;
			const response = await gmailClient.users.messages.list({
				userId: "me",
				q: query,
			});

			const messages = response.data.messages || [];
			if (messages.length > 0) {
				const payment = await parsePaymentMessage(gmailClient, messages);
				if (isObjectType(payment)) {
					return payment;
				}
			}
		}

		return null;
	});

	if (!result.success) {
		console.error("Error querying for bill payment:", result.error);
		throw new Error("Failed to query for bill payment");
	}

	return result.data;
};

export const processTenantPayments = async (
	tenant: Tenant,
	billsHistory: ConsolidatedBill[],
	dateRange: { start: string; end: string },
) => {
	const result = await safeExecuteAsync(async () => {
		const loggedInUser = await getUser();
		if (!isObjectType(loggedInUser) || !loggedInUser.accessToken) {
			throw new Error("User is not logged in");
		}

		// Find all unpaid bills for this tenant
		const unpaidBills = billsHistory.filter(
			(bill) => bill.tenantId === tenant.id && !bill.paid,
		);

		if (unpaidBills.length === 0) {
			return { processed: false, message: "No unpaid bills found for tenant" };
		}

		// Sort unpaid bills by date (oldest first to process oldest bills first)
		const sortedUnpaidBills = unpaidBills.sort((a, b) => {
			const dateA = new Date(a.year, a.month - 1, 1);
			const dateB = new Date(b.year, b.month - 1, 1);
			return dateA.getTime() - dateB.getTime();
		});

		// Search for payments from either primary name or secondary name
		const searchNames = [tenant.name];
		if (tenant.secondaryName) {
			searchNames.push(tenant.secondaryName);
		}

		const gmailClient = getGmailClient(loggedInUser.accessToken);

		// Try each name in the search
		for (const name of searchNames) {
			const query = `from:"${name}" after:${dateRange.start} before:${dateRange.end}`;
			const response = await gmailClient.users.messages.list({
				userId: "me",
				q: query,
			});

			const messages = response.data.messages || [];
			if (messages.length > 0) {
				const payment = await parsePaymentMessage(gmailClient, messages);
				if (isObjectType(payment)) {
					const paymentAmount = roundToCurrency(Number(payment.amount));

					// Check each unpaid bill to see if the payment matches
					for (const bill of sortedUnpaidBills) {
						// Calculate tenant's share for this bill
						const { tenantTotal } = getTenantShares(bill, tenant);

						// Calculate expected amount for this specific bill
						// For the first unpaid bill, include outstanding balance
						// For subsequent bills, just the tenant's share
						const isFirstUnpaidBill = bill === sortedUnpaidBills[0];
						const expectedAmount = isFirstUnpaidBill
							? tenantTotal + tenant.outstandingBalance
							: tenantTotal;

						const tolerance = 0.01; // $0.01 tolerance for rounding differences

						if (Math.abs(paymentAmount - expectedAmount) <= tolerance) {
							// Payment matches this bill! Process it
							return await processPaymentMatch(
								loggedInUser.id,
								tenant,
								bill,
								payment,
								paymentAmount,
							);
						}
					}

					// Payment found but doesn't match any unpaid bill
					const totalUnpaid =
						sortedUnpaidBills.reduce((sum, bill) => {
							const { tenantTotal } = getTenantShares(bill, tenant);
							return sum + tenantTotal;
						}, 0) + tenant.outstandingBalance;
					return {
						processed: false,
						message: `Payment found for ${tenant.name} ($${paymentAmount}) but doesn't match any unpaid bill. Total tenant unpaid: $${totalUnpaid}`,
					};
				}
			}
		}

		return {
			processed: false,
			message: `No payments found for ${tenant.name}`,
		};
	});

	if (!result.success) {
		console.error("Error processing tenant payments:", result.error);
		throw new Error("Failed to process tenant payments");
	}

	return result.data;
};

const processPaymentMatch = async (
	userId: string,
	tenant: Tenant,
	bill: ConsolidatedBill,
	payment: Payment,
	paymentAmount: number,
) => {
	const result = await safeExecuteAsync(async () => {
		// Mark bill as paid
		if (bill.id) {
			await markBillAsPaid(userId, bill.id, payment.gmailMessageId);
		}

		// Update tenant balance
		const newBalance = roundToCurrency(
			Math.max(0, tenant.outstandingBalance - paymentAmount),
		);
		await updateTenantBalance(userId, tenant.id, newBalance);

		return {
			processed: true,
			message: `Payment of $${paymentAmount} processed for ${tenant.name}`,
			paymentAmount,
			billId: bill.id,
			newBalance,
		};
	});

	if (!result.success) {
		console.error("Error processing payment match:", result.error);
		throw new Error("Failed to process payment match");
	}

	return result.data;
};
