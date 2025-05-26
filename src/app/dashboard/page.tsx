"use server";

import { redirect } from "next/navigation";

import { getServerSession } from "next-auth";

import { DashboardPage } from "@/components/dashboard";
import { getUtilityProviders } from "@/lib/data";
import { authOptions } from "@/lib/server/auth";
import { User } from "@/types/";

export default async function Page() {
	const session = await getServerSession(authOptions);
	if (!session) redirect("/");
	const loggedInUser = {
		id: session.providerAccountId,
		name: session.user.name,
		email: session.user.email,
		accessToken: session.accessToken,
		accessTokenExp: session.accessTokenExp,
	} as User;

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
