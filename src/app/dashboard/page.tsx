"use server";

import { DashboardPage } from "@/components/dashboard";
import { calculateTotalBillAmount, getBillCategory } from "@/lib/common/utils";
import { getConsolidatedBills, getUser, getUtilityProviders } from "@/lib/data";
import { fetchUserBills } from "@/lib/gmail";
import { ConsolidatedBill } from "@/types";

export default async function Page() {
	const loggedInUser = await getUser();
	const availableProviders = await getUtilityProviders(loggedInUser.id);
	const currentDate = new Date();
	const fetchedBills = await fetchUserBills(
		availableProviders,
		currentDate.getMonth() + 1, // getMonth() is zero-based
		currentDate.getFullYear(),
	);

	const lastMonthBills = await getConsolidatedBills(loggedInUser?.id, {
		month: currentDate.getMonth() - 1,
		year: currentDate.getFullYear(),
	});

	const categories = getBillCategory(fetchedBills);
	const totalAmount = calculateTotalBillAmount(fetchedBills);
	const consolidatedBillForCurrentMonth: ConsolidatedBill | null = {
		id: null, // This will be assigned when the bill is added
		userId: loggedInUser.id,
		month: currentDate.getMonth() + 1,
		year: currentDate.getFullYear(),
		tenantId: null,
		categories: categories,
		totalAmount: totalAmount,
		paid: false,
		dateSent: null,
		datePaid: null,
	};
	return (
		<main>
			<DashboardPage
				currentMonthBill={
					totalAmount === 0 ? null : consolidatedBillForCurrentMonth
				}
				lastMonthBills={lastMonthBills}
			/>
		</main>
	);
}
