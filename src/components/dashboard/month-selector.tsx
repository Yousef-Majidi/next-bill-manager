"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui";

interface MonthSelectorProps {
	readonly month: number;
	readonly year: number;
	readonly onPrevious: () => void;
	readonly onNext: () => void;
	readonly onReset: () => void;
	readonly isCurrentMonth: boolean;
	readonly canGoPrevious: boolean;
}

export const MonthSelector = ({
	month,
	year,
	onPrevious,
	onNext,
	onReset,
	isCurrentMonth,
	canGoPrevious,
}: MonthSelectorProps) => {
	const monthYearString = new Date(year, month - 1, 1).toLocaleDateString(
		"en-US",
		{
			month: "long",
			year: "numeric",
		},
	);

	return (
		<div className="bg-card flex items-center justify-between rounded-lg border p-4 shadow-sm">
			<div className="flex items-center gap-3">
				<Button
					variant="outline"
					size="sm"
					onClick={onPrevious}
					disabled={!canGoPrevious}
					className="flex items-center gap-2">
					<ChevronLeft className="h-4 w-4" />
					Previous
				</Button>

				<div className="flex flex-col items-center gap-1">
					<span className="text-foreground text-lg font-semibold">
						{monthYearString}
					</span>
					{isCurrentMonth && (
						<span className="text-muted-foreground text-xs">Current Month</span>
					)}
				</div>

				<Button
					variant="outline"
					size="sm"
					onClick={onNext}
					disabled={isCurrentMonth}
					className="flex items-center gap-2">
					Next
					<ChevronRight className="h-4 w-4" />
				</Button>
			</div>

			{!isCurrentMonth && (
				<Button variant="ghost" size="sm" onClick={onReset}>
					Reset to Current Month
				</Button>
			)}
		</div>
	);
};
