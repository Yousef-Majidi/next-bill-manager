import { gmail_v1 } from "googleapis";

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
