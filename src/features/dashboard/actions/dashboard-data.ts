"use server";

import { initializeConsolidatedBill } from "@/lib/common/utils";
import { getUser, getUtilityProviders } from "@/lib/data";
import { fetchUserBills } from "@/lib/gmail";

export async function getDashboardData(month?: number, year?: number) {
	try {
		const loggedInUser = await getUser();
		const availableProviders = await getUtilityProviders(loggedInUser.id);
		const currentDate = new Date();

		const selectedMonth = month ?? currentDate.getMonth() + 1;
		const selectedYear = year ?? currentDate.getFullYear();
		const selectedDate = new Date(selectedYear, selectedMonth - 1, 1);

		const fetchedBills = await fetchUserBills(
			availableProviders,
			selectedMonth,
			selectedYear,
		);

		const consolidatedBillForCurrentMonth = initializeConsolidatedBill({
			userId: loggedInUser.id,
			bills: fetchedBills,
			currentDate: selectedDate,
		});

		return {
			success: true,
			data: {
				user: loggedInUser,
				providers: availableProviders,
				currentMonthBill: consolidatedBillForCurrentMonth,
			},
		};
	} catch (error) {
		return {
			success: false,
			error:
				error instanceof Error
					? error.message
					: "Failed to fetch dashboard data",
		};
	}
}
