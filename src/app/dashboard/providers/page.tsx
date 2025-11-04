import type { Metadata } from "next";

import { ProvidersPage } from "@/components/providers";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
	title: "Providers | Next Bill Manager",
	description: "Manage your utility providers",
};

export default async function Page() {
	return (
		<main>
			<ProvidersPage />
		</main>
	);
}
