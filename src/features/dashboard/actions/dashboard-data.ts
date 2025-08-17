"use server";

import { initializeConsolidatedBill } from "@/lib/common/utils";
import { getUser, getUtilityProviders } from "@/lib/data";
import { fetchUserBills } from "@/lib/gmail";

export async function getDashboardData() {
	try {
		const loggedInUser = await getUser();
		const availableProviders = await getUtilityProviders(loggedInUser.id);
		const currentDate = new Date();

		const fetchedBills = await fetchUserBills(
			availableProviders,
			currentDate.getMonth() + 1,
			currentDate.getFullYear(),
		);

		const consolidatedBillForCurrentMonth = initializeConsolidatedBill({
			userId: loggedInUser.id,
			bills: fetchedBills,
			currentDate,
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
