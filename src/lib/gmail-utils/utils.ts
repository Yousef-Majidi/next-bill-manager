import { gmail_v1 } from "googleapis";

import { ConsolidatedBill, EmailContent, Tenant } from "@/types";

export const extractDollarAmount = (text: string): string[] => {
	const dollarAmountRegex = /\$[0-9,]+(?:\.[0-9]{2})?/g; // Matches dollar amounts like $123.45 or $1,234.56
	const matches = text.match(dollarAmountRegex);
	return matches ? matches : [];
};

export const parseMessages = async (
	gmailClient: gmail_v1.Gmail,
	messages: gmail_v1.Schema$Message[],
	providerName: string,
) => {
	const dollarAmounts: string[] = [];
	for (const message of messages) {
		const messageDetails = await gmailClient.users.messages.get({
			userId: "me",
			id: message.id!,
		});

		const headers = messageDetails.data.payload?.headers || [];
		const subjectHeader = headers.find(
			(header) => header.name?.toLowerCase() === "subject",
		);
		const subject = subjectHeader?.value || "No Subject";

		// Check if the subject contains the provider's name and "bill"
		if (
			!subject.toLowerCase().includes(providerName.toLowerCase()) ||
			!subject.toLowerCase().includes("bill")
		) {
			continue;
		}

		// Extract the snippet or body content
		const body = messageDetails.data.snippet || "";
		const extractedAmounts = extractDollarAmount(body);

		// Collect all dollar amounts
		dollarAmounts.push(...extractedAmounts);
	}

	return dollarAmounts;
};

export const constructTenantBillEmail = (
	tenant: Tenant,
	bill: ConsolidatedBill,
): EmailContent => {
	const subject = `Utility Bill for ${tenant.name} - ${bill.month}/${bill.year}`;
	const tenantShares = bill.tenantShares;
	const categoryDetails = Object.entries(bill.categories)
		.map(
			([category, details]) =>
				`${category}: $${details.amount.toFixed(2)} (${details.provider.name})`,
		)
		.join("\n");
	const tenantTotal = bill.tenantTotalShare.toFixed(2);
	const body = `
		Hello ${tenant.name},

		Here is your utility bill for the month of ${bill.month}/${bill.year}.

		Total Amount Due: $${tenantTotal}
		Category Breakdown:
		${categoryDetails}
		Your Share of the Bill:
		${Object.entries(tenantShares)
			.map(
				([category, share]) =>
					`${category}: $${share ? share.toFixed(2) : "0.00"}`,
			)
			.join("\n")}

		Please ensure to make the payment by the due date.
		If you have any questions or concerns, feel free to reach out.

		Thank you,
		Sent from Next Bill Manager
	`;

	return {
		subject,
		body,
	};
};
