"use server";

import { DashboardPage } from "@/components/dashboard";
import { getTenants, getUser, getUtilityProviders } from "@/lib/data";
import { fetchUserBills } from "@/lib/gmail-utils";

export default async function Page() {
	const loggedInUser = await getUser();
	const availableProviders = await getUtilityProviders(loggedInUser.id);
	const currentDate = new Date();
	const fetchedBills = await fetchUserBills(
		availableProviders,
		currentDate.getMonth() + 1, // getMonth() is zero-based
		currentDate.getFullYear(),
	);
	const fetchedTenants = await getTenants(loggedInUser.id);
	return (
		<main>
			<DashboardPage
				loggedInUser={loggedInUser}
				utilityProviders={availableProviders}
				currentMonthBills={fetchedBills}
				tenants={fetchedTenants}
			/>
		</main>
	);
}
