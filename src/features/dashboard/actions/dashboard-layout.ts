"use server";

import {
	getConsolidatedBills,
	getTenants,
	getUser,
	getUtilityProviders,
} from "@/lib/data";

export async function getDashboardLayoutData() {
	try {
		const loggedInUser = await getUser();
		const fetchedProviders = await getUtilityProviders(loggedInUser.id);
		const fetchedTenants = await getTenants(loggedInUser.id);
		const fetchedBills = await getConsolidatedBills(loggedInUser.id);

		return {
			success: true,
			data: {
				user: loggedInUser,
				providers: fetchedProviders,
				tenants: fetchedTenants,
				billsHistory: fetchedBills,
			},
		};
	} catch (error) {
		return {
			success: false,
			error:
				error instanceof Error ? error.message : "Failed to fetch layout data",
		};
	}
}
