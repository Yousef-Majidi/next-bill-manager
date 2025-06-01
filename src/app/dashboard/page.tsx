"use server";

import { DashboardPage } from "@/components/dashboard";
import { getUser, getUtilityProviders } from "@/lib/data";
import { fetchUserBills } from "@/lib/gmail-utils";

export default async function Page() {
	const loggedInUser = await getUser();
	const availableProviders = await getUtilityProviders(loggedInUser.id);
	// const currentDate = new Date();
	const currentDate = new Date("2025-06-01");
	const fetchedBills = await fetchUserBills(
		availableProviders,
		currentDate.getMonth() + 1, // getMonth() is zero-based
		currentDate.getFullYear(),
	);
	return (
		<main>
			<DashboardPage currentMonthBills={fetchedBills} />
		</main>
	);
}
