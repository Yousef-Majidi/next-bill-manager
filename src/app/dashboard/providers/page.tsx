"use server";

import { redirect } from "next/navigation";

import { getServerSession } from "next-auth";

import { ProvidersPage } from "@/components/providers";
import { getUtilityProviders } from "@/lib/data";
import { authOptions } from "@/lib/server/auth";
import { UtilityProvider } from "@/types";

export default async function Page() {
	const session = await getServerSession(authOptions);
	if (!session) redirect("/");
	const fetchedUtilityProviders = await getUtilityProviders(
		session.providerAccountId,
	);
	const utilityProviders = fetchedUtilityProviders.map((provider) => ({
		id: provider.id,
		userId: provider.userId,
		name: provider.name,
		category: provider.category,
	})) as UtilityProvider[];

	return (
		<main>
			<ProvidersPage utilityProviders={utilityProviders || []} />
		</main>
	);
}
