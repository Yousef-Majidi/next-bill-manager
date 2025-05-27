"use server";

import { getUser } from "@/lib/data";
import { parseMessages } from "@/lib/gmail-utils";
import { getGmailClient } from "@/lib/gmail-utils/client";
import { UtilityProviderBill as Bill, UtilityProvider } from "@/types";

export const fetchUserBills = async (
	providers: UtilityProvider[],
	month: number,
	year: number,
): Promise<Bill[]> => {
	const loggedInUser = await getUser();
	if (!loggedInUser) {
		throw new Error("User not authenticated");
	}

	try {
		const gmailClient = getGmailClient(loggedInUser.accessToken || "");
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
					...provider,
					amount: 0,
					month,
					year,
					sent: false,
					sentTo: null,
				});
				continue;
			}

			const dollarAmounts = await parseMessages(
				gmailClient,
				messages,
				provider.name,
			);

			const totalAmount = dollarAmounts
				.map((amount) => parseFloat(amount.replace(/[$,]/g, ""))) // remove $ and commas
				.reduce((sum, value) => sum + value, 0);

			bills.push({
				...provider,
				amount: totalAmount,
				month,
				year,
				sent: false,
				sentTo: null,
			});
		}

		return bills;
	} catch (error) {
		console.error("Error fetching bills:", error);
		throw new Error("Failed to fetch bills");
	}
};
