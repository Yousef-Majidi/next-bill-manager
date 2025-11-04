import type { Metadata } from "next";

import { DashboardPage } from "@/components/dashboard";
import { getDashboardData } from "@/features/dashboard/actions";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
	title: "Dashboard | Next Bill Manager",
	description: "View your bill management dashboard",
};

interface PageProps {
	readonly searchParams: Promise<{ month?: string; year?: string }>;
}

export default async function Page({ searchParams }: PageProps) {
	const params = await searchParams;
	const currentDate = new Date();

	let month: number | undefined;
	let year: number | undefined;

	if (params.month && params.year) {
		const parsedMonth = parseInt(params.month, 10);
		const parsedYear = parseInt(params.year, 10);

		// Validate month and year are within reasonable range
		if (
			parsedMonth >= 1 &&
			parsedMonth <= 12 &&
			parsedYear >= currentDate.getFullYear() - 2 &&
			parsedYear <= currentDate.getFullYear()
		) {
			// Only allow past months up to current month
			const selectedDate = new Date(parsedYear, parsedMonth - 1, 1);
			const currentMonthStart = new Date(
				currentDate.getFullYear(),
				currentDate.getMonth(),
				1,
			);

			if (selectedDate <= currentMonthStart) {
				month = parsedMonth;
				year = parsedYear;
			}
		}
	}

	const result = await getDashboardData(month, year);

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
