"use server";

import { getServerSession } from "next-auth";

import { Dashboard } from "@/components/dashboard/dashboard";
import { authOptions } from "@/lib/server/auth";
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

	return (
		<main>
			<Dashboard user={loggedInUser} />
		</main>
	);
}
