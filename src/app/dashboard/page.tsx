"use server";

import { DashboardPage } from "@/components/dashboard";
import { getConsolidatedBills, getUser, getUtilityProviders } from "@/lib/data";
import { fetchUserBills } from "@/lib/gmail";

export default async function Page() {
	const loggedInUser = await getUser();
	const availableProviders = await getUtilityProviders(loggedInUser.id);
	const currentDate = new Date();
	const fetchedBills = await fetchUserBills(
		availableProviders,
		currentDate.getMonth() + 1, // getMonth() is zero-based
		currentDate.getFullYear(),
	);

	const lastMonthBills = await getConsolidatedBills(loggedInUser?.id, {
		month: currentDate.getMonth() - 1,
		year: currentDate.getFullYear(),
	});
	return (
		<main>
			<DashboardPage
				currentMonthBills={fetchedBills}
				lastMonthBills={lastMonthBills}
			/>
		</main>
	);
}
