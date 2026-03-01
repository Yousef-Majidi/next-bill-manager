import {
	CheckCircle,
	Clock,
	CreditCard,
	DollarSign,
	TrendingUp,
} from "lucide-react";

import { StatCard } from "@/components/dashboard/stat-card";

interface StatsSummaryProps {
	readonly currentMonthTotal: number;
	readonly lastMonthTotal: number;
	readonly outstandingBalance: number;
	readonly paidAmount: number;
	readonly selectedMonth: number;
	readonly selectedYear: number;
}

export const StatsSummary = ({
	currentMonthTotal,
	lastMonthTotal,
	outstandingBalance,
	paidAmount,
	selectedMonth,
	selectedYear,
}: StatsSummaryProps) => {
	const selectedDate = new Date(selectedYear, selectedMonth - 1, 1);
	const lastMonth = new Date(selectedYear, selectedMonth - 2, 1);
	const formatMonthYear = (date: Date) =>
		date.toLocaleDateString("en-US", {
			month: "long",
			year: "numeric",
		});

	const currentDateString = formatMonthYear(selectedDate);
	const lastMonthString = formatMonthYear(lastMonth);
	return (
		<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
			<StatCard
				title="Current Month Bills"
				icon={<DollarSign className="h-5 w-5" />}
				value={`$${currentMonthTotal.toFixed(2)}`}
				description={currentDateString}
				className="border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50"
				iconClassName="text-blue-600"
			/>

			<StatCard
				title="Last Month Billed"
				icon={<TrendingUp className="h-5 w-5" />}
				value={`$${lastMonthTotal.toFixed(2)}`}
				description={lastMonthString}
				className="border-green-200 bg-gradient-to-br from-green-50 to-emerald-50"
				iconClassName="text-green-600"
			/>

			<StatCard
				title="Paid Amount"
				icon={<CheckCircle className="h-5 w-5" />}
				value={`$${paidAmount.toFixed(2)}`}
				description="Last month"
				className="border-purple-200 bg-gradient-to-br from-purple-50 to-violet-50"
				iconClassName="text-purple-600"
			/>

			<StatCard
				title={outstandingBalance < 0 ? "Credit Balance" : "Outstanding"}
				icon={
					outstandingBalance < 0 ? (
						<CreditCard className="h-5 w-5" />
					) : (
						<Clock className="h-5 w-5" />
					)
				}
				value={`$${Math.abs(outstandingBalance).toFixed(2)}`}
				description={
					outstandingBalance < 0 ? "Overpaid amount" : "Unpaid bills"
				}
				className={
					outstandingBalance < 0
						? "border-emerald-200 bg-gradient-to-br from-emerald-50 to-green-50"
						: "border-orange-200 bg-gradient-to-br from-orange-50 to-red-50"
				}
				iconClassName={
					outstandingBalance < 0 ? "text-emerald-600" : "text-orange-600"
				}
			/>
		</div>
	);
};
