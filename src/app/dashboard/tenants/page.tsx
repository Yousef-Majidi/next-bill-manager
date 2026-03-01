import type { Metadata } from "next";

import { TenantsPage } from "@/components/tenants";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
	title: "Tenants | Next Bill Manager",
	description: "Manage your tenants and their utility shares",
};

export default async function Page() {
	return (
		<main>
			<TenantsPage />
		</main>
	);
}
