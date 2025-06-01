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

export const constructTenantBillEmail = (
	tenant: Tenant,
	bill: ConsolidatedBill,
): EmailContent => {
	const date = new Date(bill.year, bill.month - 1);
	const monthString = date.toLocaleString("en-US", { month: "long" });
	const subject = `Utility Bill for ${tenant.name} - ${monthString} ${bill.year}`;
	const tenantShares = bill.tenantShares;

	// Build category breakdown table rows
	const categoryDetailsRows = Object.entries(bill.categories)
		.map(
			([category, details]) =>
				`<tr>
                    <td>${category}</td>
                    <td>$${details.amount.toFixed(2)}</td>
                    <td>${details.provider.name}</td>
                </tr>`,
		)
		.join("");

	// Build tenant share table rows
	const tenantSharesRows = Object.entries(tenantShares)
		.map(
			([category, share]) =>
				`<tr>
                    <td>${category}</td>
                    <td>$${share ? share.toFixed(2) : "0.00"}</td>
                </tr>`,
		)
		.join("");

	const tenantTotal = bill.tenantTotalShare.toFixed(2);

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
            </style>
        </head>
        <body>
            <p>Hello ${tenant.name},</p>
            <p>Here is your utility bill for ${monthString} ${bill.year}.</p>
            <p><strong>Total Amount Due: $${tenantTotal}</strong> </p>
            <p><strong>Category Breakdown:</strong></p>
            <table>
                <thead>
                    <tr>
                        <th>Category</th>
                        <th>Amount</th>
                        <th>Provider</th>
                    </tr>
                </thead>
                <tbody>
                    ${categoryDetailsRows}
                </tbody>
            </table>
            <p><strong>Your Share of the Bill:</strong></p>
            <table>
                <thead>
                    <tr>
                        <th>Category</th>
                        <th>Amount</th>
                    </tr>
                </thead>
                <tbody>
                    ${tenantSharesRows}
                </tbody>
            </table>
            <p>Please ensure to make the payment by the due date.</p>
            <p>If you have any questions or concerns, feel free to reach out.</p>
			<p>If you need to view the original bill, please contact your landlord.</p>
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
