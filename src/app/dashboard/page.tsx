"use server";

import { redirect } from "next/navigation";

import { getServerSession } from "next-auth";

import { Dashboard } from "@/components/dashboard";
import { authOptions } from "@/lib/server/auth";
import { User } from "@/types/";

export default async function DashboardPage() {
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
