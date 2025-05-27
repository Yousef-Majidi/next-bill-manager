import { Droplet, Flame, Zap } from "lucide-react";

import { UtilityProviderCategory as BillCategory, UtilityBill } from "@/types";

interface BillBreakdownProps {
	readonly currentMonthBills: UtilityBill[];
}

export const BillBreakdown = ({ currentMonthBills }: BillBreakdownProps) => {
	return (
		<div className="flex flex-wrap gap-4">
			{currentMonthBills.map((bill) => (
				<div
					key={bill.id}
					className="max-w-sm min-w-[220px] flex-1 rounded-lg border p-4"
					style={{ flexBasis: "300px" }}>
					<div className="mb-2 flex items-center justify-between">
						<h4 className="font-medium">{bill.utilityProvider.name}</h4>
						{/* Icon based on category */}
						{bill.utilityProvider.category === BillCategory.Electricity && (
							<Zap className="h-4 w-4 text-yellow-600" />
						)}
						{bill.utilityProvider.category === BillCategory.Water && (
							<Droplet className="h-4 w-4 text-blue-600" />
						)}
						{bill.utilityProvider.category === "Gas" && (
							<Flame className="h-4 w-4 text-red-600" />
						)}
					</div>
					<p className="text-2xl font-bold">${bill.amount.toFixed(2)}</p>
					<p className="text-muted-foreground text-xs">
						{bill.sent ? `Sent to: ${bill.sentTo || "N/A"}` : "Not Sent"}
					</p>
				</div>
			))}
		</div>
	);
};
