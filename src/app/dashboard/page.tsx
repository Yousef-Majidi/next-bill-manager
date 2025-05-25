"use server";

import { getServerSession } from "next-auth";

import { Dashboard } from "@/components/dashboard";
import { getUtilityProviders } from "@/lib/data/actions";
import { authOptions } from "@/lib/server";
import { User } from "@/types/";

export default async function DashboardPage() {
	const session = await getServerSession(authOptions);
	const loggedInUser = {
		id: session.providerAccountId,
		name: session.user.name,
		email: session.user.email,
		accessToken: session.accessToken,
		accessTokenExp: session.accessTokenExpires,
	} as User;

	const providers = await getUtilityProviders();
	console.log("Utility Providers:", providers);

	return (
		<main>
			<Dashboard loggedInUser={loggedInUser} />
		</main>
	);
}
