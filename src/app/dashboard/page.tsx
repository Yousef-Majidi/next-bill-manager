import type { Metadata } from "next";

import { DashboardPage } from "@/components/dashboard";
import { getDashboardData } from "@/features/dashboard/actions";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
	title: "Dashboard | Next Bill Manager",
	description: "View your bill management dashboard",
};

export default async function Page() {
	const result = await getDashboardData();

	if (!result.success || !result.data) {
		throw new Error(result.error || "Failed to fetch dashboard data");
	}

	const { currentMonthBill } = result.data;

	return (
		<main>
			<DashboardPage currentMonthBill={currentMonthBill} />
		</main>
	);
}
