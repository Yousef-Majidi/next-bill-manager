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
	const subject = `Utility Bill for ${monthString} of ${bill.year}`;
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
                <td>${category}</td>
                <td>$${total.toFixed(2)}</td>
                <td>${details.providerName}</td>
                <td>${percent}%</td>
                <td>$${tenantShare.toFixed(2)}</td>
            </tr>
        `;
		})
		.join("");

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
        }
    </style>
</head>
<body>
    <p>Hello ${tenant.name},</p>
    <p>Here is your utility bills for ${monthString} ${bill.year}.</p>
    
    <p><strong>Bill Breakdown:</strong></p>
    <table>
        <thead>
            <tr>
                <th>Category</th>
                <th>Total Amount</th>
                <th>Provider</th>
                <th>Your % Share</th>
                <th>Your $ Share</th>
            </tr>
        </thead>
        <tbody>
            ${consolidatedRows}
        </tbody>
    </table>
    <br/>
    <div>
        <p><strong>Your Amount Due for this Month:</strong> $${tenantTotal.toFixed(2)}</p>
        <p><strong>Outstanding Balance:</strong> $${outstandingBalance.toFixed(2)}</p>
        <p><strong>Final Amount Due:</strong> $${finalAmountDue.toFixed(2)}</p>
    </div>
    <p>Please ensure to make the payment by the due date.</p>
    <p>If you have any questions, concerns or you'd like to view the original bill, please contact your landlord.</p>
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
