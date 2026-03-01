import type { Metadata } from "next";

import { BillsHistoryPage } from "@/components/bills-history/bills-history-page";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
	title: "Bills | Next Bill Manager",
	description: "View your bill history and manage bills",
};

export default async function BillsPage() {
	return <BillsHistoryPage />;
}
