"use server";

import { DashboardPage } from "@/components/dashboard";
import { getUser, getUtilityProviders } from "@/lib/data";

export default async function Page() {
	const loggedInUser = await getUser();
	const availableProviders = await getUtilityProviders(loggedInUser.id);

	return (
		<main>
			<DashboardPage
				loggedInUser={loggedInUser}
				utilityProviders={availableProviders}
			/>
		</main>
	);
}
