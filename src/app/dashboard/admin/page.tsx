import type { Metadata } from "next";

import { AdminPageClient } from "@/components/admin";
import {
	getConsolidatedBills,
	getTenants,
	getUser,
	getUtilityProviders,
} from "@/lib/data";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
	title: "Data Management | Next Bill Manager",
	description: "View and manage all your data",
};

export default async function AdminPage() {
	const user = await getUser();
	const bills = await getConsolidatedBills(user.id);
	const tenants = await getTenants(user.id);
	const providers = await getUtilityProviders(user.id);

	return (
		<AdminPageClient
			bills={bills}
			tenants={tenants}
			providers={providers}
			userId={user.id}
		/>
	);
}
