"use server";

import { initializeConsolidatedBill } from "@/lib/common/utils";
import { getConsolidatedBills, getUser, getUtilityProviders } from "@/lib/data";
import { fetchUserBills } from "@/lib/gmail";

export async function fetchMonthData(month: number, year: number) {
	try {
		const loggedInUser = await getUser();
		const selectedDate = new Date(year, month - 1, 1);

		// Always check database first for all months
		// This ensures we get saved bills even if they exist
		const savedBills = await getConsolidatedBills(loggedInUser.id, {
			year,
			month,
		});

		// If we found a saved bill for this month, return it
		// Note: There might be multiple bills if sent to different tenants
		// We'll return the first one (they should have the same totals)
		if (savedBills && savedBills.length > 0) {
			const bill = savedBills[0];
			if (bill) {
				return {
					success: true,
					data: {
						consolidatedBill: bill,
					},
				};
			}
		}

		// If no saved bill found, fetch from Gmail (mainly for current month)
		const availableProviders = await getUtilityProviders(loggedInUser.id);
		const fetchedBills = await fetchUserBills(availableProviders, month, year);

		const consolidatedBill = initializeConsolidatedBill({
			userId: loggedInUser.id,
			bills: fetchedBills,
			currentDate: selectedDate,
		});

		return {
			success: true,
			data: {
				consolidatedBill,
			},
		};
	} catch (error) {
		return {
			success: false,
			error:
				error instanceof Error ? error.message : "Failed to fetch month data",
		};
	}
}
