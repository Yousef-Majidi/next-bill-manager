"use server";

import { redirect } from "next/navigation";

import { getServerSession } from "next-auth";

// import { getSession } from "next-auth/react";

import { Dashboard } from "@/components/dashboard";
import { getUtilityProviders } from "@/lib/data";
import { authOptions } from "@/lib/server/auth";
import { User } from "@/types/";

export default async function DashboardPage() {
	const providers = await getUtilityProviders();
	console.log("Utility Providers:", providers);

	const session = await getServerSession(authOptions);
	if (!session) redirect("/");
	const loggedInUser = {
		id: session.providerAccountId,
		name: session.user.name,
		email: session.user.email,
		accessToken: session.accessToken,
		accessTokenExp: session.accessTokenExp,
	} as User;

	return (
		<main>
			<Dashboard loggedInUser={loggedInUser} />
		</main>
	);
}
