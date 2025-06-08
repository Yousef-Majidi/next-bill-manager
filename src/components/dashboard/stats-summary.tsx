import { CheckCircle, Clock, DollarSign } from "lucide-react";

import { StatCard } from "@/components/dashboard/stat-card";

interface StatsSummaryProps {
	readonly currentMonthTotal: number;
	readonly lastMonthTotal: number;
	readonly outstandingBalance: number;
}

export const StatsSummary = ({
	currentMonthTotal,
	lastMonthTotal,
	outstandingBalance,
}: StatsSummaryProps) => {
	const now = new Date();
	const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
	const formatMonthYear = (date: Date) =>
		date.toLocaleDateString("en-US", {
			month: "long",
			year: "numeric",
		});

	const currentDateString = formatMonthYear(now);
	const lastMonthString = formatMonthYear(lastMonth);
	return (
		<div className="flex flex-wrap gap-4">
			<StatCard
				title="Current Month Bills"
				icon={<DollarSign className="h-4 w-4" />}
				value={`$${currentMonthTotal.toFixed(2)}`}
				description={currentDateString}
			/>

			<StatCard
				title="Last Month Billed"
				icon={<DollarSign className="text-muted-foreground h-4 w-4" />}
				value={lastMonthTotal.toFixed(2)}
				description={lastMonthString}
				className="text-blue-600"
			/>

			<StatCard
				title="Paid Amount"
				icon={<CheckCircle className="h-4 w-4 text-green-600" />}
				value={(0.0).toFixed(2)}
				description="Last month"
				className="text-green-600"
			/>

			<StatCard
				title="Outstanding"
				icon={<Clock className="h-4 w-4 text-orange-600" />}
				value={outstandingBalance.toFixed(2)}
				description="Unpaid bills"
				className="text-orange-600"
			/>
		</div>
	);
};
