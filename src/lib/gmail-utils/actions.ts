"use server";

import { redirect } from "next/navigation";

import { getUser, isTokenExpired } from "@/lib/data";
import { parseMessages } from "@/lib/gmail-utils";
import { getGmailClient } from "@/lib/gmail-utils/client";
import { UtilityBill as Bill, UtilityProvider } from "@/types";

export const fetchUserBills = async (
	providers: UtilityProvider[],
	month: number,
	year: number,
): Promise<Bill[]> => {
	try {
		const loggedInUser = await getUser();
		if (
			!loggedInUser ||
			!isTokenExpired(
				loggedInUser.accessTokenExp ? loggedInUser.accessTokenExp : 0,
			)
		) {
			console.warn("User is not logged in or token is invalid.");
			redirect("/");
		}

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
					utilityProvider: provider,
					amount: 0,
					month,
					year,
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
				utilityProvider: provider,
				amount: totalAmount,
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
