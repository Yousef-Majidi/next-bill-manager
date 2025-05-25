"use server";

import { Dashboard } from "@/components/dashboard";
import { getUtilityProviders } from "@/lib/data";
import { User } from "@/types/";

export default async function DashboardPage() {
	const loggedInUser = {
		id: "123",
		name: "John Doe",
		email: "test@test.com",
		accessToken: "1234567890",
		accessTokenExp: 1234567890,
	} as User;

	const providers = await getUtilityProviders();
	console.log("Utility Providers:", providers);

	return (
		<main>
			<Dashboard loggedInUser={loggedInUser} />
		</main>
	);
}
