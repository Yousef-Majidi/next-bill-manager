import { gmail_v1 } from "googleapis";

import { getTenantShares } from "@/lib/common/utils";
import { ConsolidatedBill, EmailContent, Tenant } from "@/types";

export const extractDollarAmount = (text: string): string[] => {
	// const dollarAmountRegex = /\$[0-9,]+(?:\.[0-9]{2})?/g; // Matches dollar amounts like $123.45 or $1,234.56
	const dollarAmountRegex = /\d+\.\d{2}/g; // Matches dollar amounts like 123.45 or 1,234.56 without the dollar sign
	const matches = text.match(dollarAmountRegex);
	return matches ? matches : [];
};

export const parseMessages = async (
	gmailClient: gmail_v1.Gmail,
	messages: gmail_v1.Schema$Message[],
	providerName: string,
) => {
	const billDetails: { messageId: string; dollarAmount: number }[] = [];
	for (const message of messages) {
		const messageId = message.id;
		const messageDetails = await gmailClient.users.messages.get({
			userId: "me",
			id: messageId!,
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

		const body = messageDetails.data.snippet || "";

		const extractedAmounts = extractDollarAmount(body);
		for (const amount of extractedAmounts) {
			const numericAmount = parseFloat(amount.replace(/[$,]/g, ""));
			if (!isNaN(numericAmount)) {
				billDetails.push({
					messageId: messageId!,
					dollarAmount: numericAmount,
				});
			}
		}
	}

	return billDetails;
};

export const constructEmail = (
	tenant: Tenant,
	bill: ConsolidatedBill,
): EmailContent => {
	const date = new Date(bill.year, bill.month - 1);
	const monthString = date.toLocaleString("en-US", { month: "long" });
	const subject = `Utility Bills for ${monthString} of ${bill.year}`;
	const { shares, tenantTotal } = getTenantShares(bill, tenant);
	const outstandingBalance = tenant.outstandingBalance;
	const finalAmountDue = tenantTotal + outstandingBalance;

	const consolidatedRows = Object.entries(bill.categories)
		.map(([category, details]) => {
			const total = details.amount;
			const tenantShare = shares[category as keyof typeof shares] ?? 0;
			const percent =
				total > 0 ? ((tenantShare / total) * 100).toFixed(1) : "0.0";
			return `
			<tr>
				<td>${category} - ${details.providerName}</td>
				<td>$${total.toFixed(2)}</td>
				<td>${percent}%</td>
				<td>$${tenantShare.toFixed(2)}</td>
			</tr>
		`;
		})
		.join("");

	// Summary rows for the bottom of the table
	const summaryRows = `
		<tr class="summary-row">
			<td><strong>Your share for this month:</strong></td>
			<td></td>
			<td></td>
			<td><strong>$${tenantTotal.toFixed(2)}</strong></td>
		</tr>
		<tr class="summary-row" style="color: red;">
			<td><strong>Outstanding balance:</strong></td>
			<td></td>
			<td></td>
			<td><strong>$${outstandingBalance.toFixed(2)}</strong></td>
		</tr>
		<tr class="summary-row">
			<td><strong>Total Amount Due:</strong></td>
			<td></td>
			<td></td>
			<td><strong>$${finalAmountDue.toFixed(2)}</strong></td>
		</tr>
	`;

	// Construct the email body with HTML
	const body = `
		<!DOCTYPE html>
<html>
<head>
	<style>
		table {
			width: 100%;
			border-collapse: collapse;
		}
		th, td {
			border: 1px solid #ddd;
			padding: 8px;
			text-align: left;
		}
		th {
			background-color: #f2f2f2;
		}
		.summary-row {
			font-weight: bold;
			background-color: #f9f9f9;
		}
		.strong-hr {
			border: 0;
			height: 4px;
			background: #333;
			margin: 16px 0;
		}
	</style>
</head>
<body>
	<p>Hello ${tenant.name},</p>
	<br>
	<p>Here is your utility bills for ${monthString} ${bill.year}.</p>
	<br>
	<p><strong>Bill Breakdown:</strong></p>
	<table>
		<thead>
			<tr>
				<th>Provider</th>
				<th>Total Amount</th>
				<th>Your % Share</th>
				<th>Your $ Share</th>
			</tr>
		</thead>
		<tbody>
			${consolidatedRows}
			${summaryRows}
		</tbody>
	</table>
	<br/>
	<p>Please ensure to make the payment by the due date.</p>
	<p>If you have any questions, concerns or you'd like to view the original bill, please contact your landlord.</p>
	<br>
	<p>Thank you,</p>
	<p>Sent from Next Bill Manager</p>
</body>
</html>
	`;

	return {
		subject,
		body,
	};
};
