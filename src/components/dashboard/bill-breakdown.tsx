import { Droplet, Flame, Zap } from "lucide-react";

import {
	UtilityProviderCategory as BillCategory,
	ConsolidatedBill,
} from "@/types";

interface BillBreakdownProps {
	// readonly currentMonthBills: UtilityBill[];
	// readonly selectedTenant?: Tenant | null;
	readonly consolidatedBill: ConsolidatedBill;
}

export const BillBreakdown = ({
	// currentMonthBills,
	// selectedTenant,
	consolidatedBill,
}: BillBreakdownProps) => {
	const { categories, tenant } = consolidatedBill;
	return (
		<div className="flex flex-wrap gap-4">
			{Object.entries(categories).map(([categoryKey, bill]) => {
				const sharePercent =
					tenant.shares?.[categoryKey as keyof typeof BillCategory] ?? 0;
				const tenantShare = bill.amount * (sharePercent / 100);

				return (
					<div
						key={bill.provider.id}
						className="max-w-sm min-w-[220px] flex-1 rounded-lg border p-4"
						style={{ flexBasis: "300px" }}>
						<div className="mb-2 flex items-center justify-between">
							<h4 className="font-medium">{bill.provider.name}</h4>
							{categoryKey === BillCategory.Electricity && (
								<Zap className="h-4 w-4 text-yellow-600" />
							)}
							{categoryKey === BillCategory.Water && (
								<Droplet className="h-4 w-4 text-blue-600" />
							)}
							{categoryKey === BillCategory.Gas && (
								<Flame className="h-4 w-4 text-red-600" />
							)}
						</div>
						<p className="text-2xl font-bold">${bill.amount.toFixed(2)}</p>
						<p className="text-primary text-xs font-semibold">
							Tenant&apos;s share: ${tenantShare.toFixed(2)} ({sharePercent}%)
						</p>
					</div>
				);
			})}
		</div>
	);
};
