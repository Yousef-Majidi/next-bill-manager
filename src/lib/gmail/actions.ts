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
		if (!isObjectType(loggedInUser)) {
			throw new Error("User is not logged in");
		}

		const demoUserId = process.env.DEMO_USER_ID;
		const isDemoUser = demoUserId && loggedInUser.id === demoUserId;

		if (isDemoUser) {
			// Demo mode: return empty array (bills are pre-populated in database)
			return [];
		}

		if (!loggedInUser.accessToken) {
			throw new Error("User is not logged in");
		}
		const gmailClient = getGmailClient(loggedInUser.accessToken);
		const bills: Bill[] = [];

		for (const provider of providers) {
			// Calculate the first day of the next month
			const nextMonthDate = new Date(year, month, 1);
			const nextMonth = nextMonthDate.getMonth() + 1;
			const nextYear = nextMonthDate.getFullYear();
			// Format dates with proper zero-padding for Gmail query
			const startDate = `${year}-${String(month).padStart(2, "0")}-01`;
			const endDate = `${nextYear}-${String(nextMonth).padStart(2, "0")}-01`;
			const query = `${provider.name} after:${startDate} before:${endDate}`;

			const response = await gmailClient.users.messages.list({
				userId: "me",
				q: query,
			});

			const messages = response.data.messages || [];
			if (messages.length === 0) {
				// No messages found for this provider in this month
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

			// Only add bill if we found actual bill details
			// If parseMessages filtered out all messages (no matching subject), amount will be 0
			const totalAmount = billDetails.reduce(
				(total, detail) => total + detail.dollarAmount,
				0,
			);

			bills.push({
				id: null, // Assuming id is generated later or not needed immediately
				utilityProvider: provider,
				gmailMessageId: billDetails.map((detail) => detail.messageId).join(","),
				amount: totalAmount,
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
		if (!isObjectType(loggedInUser)) {
			throw new Error("User is not logged in");
		}

		const demoUserId = process.env.DEMO_USER_ID;
		const isDemoUser = demoUserId && loggedInUser.id === demoUserId;

		if (isDemoUser) {
			// Demo mode: return mock success response
			return {
				success: true,
				messageId: "demo-message-id",
				demoMode: true,
			};
		}

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
		if (!isObjectType(loggedInUser)) {
			throw new Error("User is not logged in");
		}

		const demoUserId = process.env.DEMO_USER_ID;
		const isDemoUser = demoUserId && loggedInUser.id === demoUserId;

		if (isDemoUser) {
			// Demo mode: return null (payment detection disabled)
			return null;
		}

		if (!loggedInUser.accessToken) {
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
		if (!isObjectType(loggedInUser)) {
			throw new Error("User is not logged in");
		}

		const demoUserId = process.env.DEMO_USER_ID;
		const isDemoUser = demoUserId && loggedInUser.id === demoUserId;

		if (isDemoUser) {
			// Demo mode: return message indicating payment detection is disabled
			return {
				processed: false,
				message:
					"Demo mode: Payment detection is disabled. You can manually mark bills as paid.",
				demoMode: true,
			};
		}

		if (!loggedInUser.accessToken) {
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

					// Find the best matching unpaid bill for this payment
					let bestMatch: {
						bill: ConsolidatedBill;
						expectedAmount: number;
						difference: number;
					} | null = null;

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

						const difference = Math.abs(paymentAmount - expectedAmount);

						// Find the bill with the smallest difference (closest match)
						if (!bestMatch || difference < bestMatch.difference) {
							bestMatch = {
								bill,
								expectedAmount,
								difference,
							};
						}
					}

					// Process the payment for the best matching bill
					if (bestMatch) {
						return await processPaymentMatch(
							loggedInUser.id,
							tenant,
							bestMatch.bill,
							payment,
							paymentAmount,
							bestMatch.expectedAmount,
						);
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
	expectedAmount: number,
) => {
	const result = await safeExecuteAsync(async () => {
		// Mark bill as paid
		if (bill.id) {
			await markBillAsPaid(userId, bill.id, payment.gmailMessageId);
		}

		// Calculate payment difference and new balance
		const paymentDifference = paymentAmount - expectedAmount;
		let newBalance: number;
		let paymentStatus: string;

		if (Math.abs(paymentDifference) <= 0.01) {
			// Exact payment (within $0.01 tolerance)
			newBalance = 0;
			paymentStatus = "exact";
		} else if (paymentDifference > 0) {
			// Overpayment - create credit (negative balance)
			newBalance = roundToCurrency(-paymentDifference);
			paymentStatus = "overpaid";
		} else {
			// Underpayment - remaining balance
			newBalance = roundToCurrency(Math.abs(paymentDifference));
			paymentStatus = "underpaid";
		}

		await updateTenantBalance(userId, tenant.id, newBalance);

		// Create appropriate message based on payment status
		let message: string;
		switch (paymentStatus) {
			case "exact":
				message = `Payment of $${paymentAmount} processed for ${tenant.name}. Bill paid in full.`;
				break;
			case "overpaid":
				message = `Payment of $${paymentAmount} processed for ${tenant.name}. Overpaid by $${Math.abs(paymentDifference).toFixed(2)}. Credit balance: $${Math.abs(newBalance).toFixed(2)}.`;
				break;
			case "underpaid":
				message = `Payment of $${paymentAmount} processed for ${tenant.name}. Underpaid by $${Math.abs(paymentDifference).toFixed(2)}. Remaining balance: $${newBalance.toFixed(2)}.`;
				break;
			default:
				message = `Payment of $${paymentAmount} processed for ${tenant.name}`;
		}

		return {
			processed: true,
			message,
			paymentAmount,
			expectedAmount,
			paymentDifference,
			paymentStatus,
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
