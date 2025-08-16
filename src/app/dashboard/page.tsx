"use server";

import { DashboardPage } from "@/components/dashboard";
import { initializeConsolidatedBill } from "@/lib/common/utils";
import { getUser, getUtilityProviders } from "@/lib/data";
import { fetchUserBills } from "@/lib/gmail";

export default async function Page() {
	const loggedInUser = await getUser();
	const availableProviders = await getUtilityProviders(loggedInUser.id);
	const currentDate = new Date();
	// currentDate.setMonth(currentDate.getMonth() - 1); // Set to prev month for testing
	const fetchedBills = await fetchUserBills(
		availableProviders,
		currentDate.getMonth() + 1, // getMonth() is zero-based
		currentDate.getFullYear(),
	);

	const consolidatedBillForCurrentMonth = initializeConsolidatedBill({
		userId: loggedInUser.id,
		bills: fetchedBills,
		currentDate,
	});

	return (
		<main>
			<DashboardPage currentMonthBill={consolidatedBillForCurrentMonth} />
		</main>
	);
}
