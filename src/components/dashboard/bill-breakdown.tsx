"use client";

import { useState } from "react";

import { useAtom } from "jotai";
import { Droplet, Edit, Flame, RotateCcw, Zap } from "lucide-react";

import {
	Button,
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	Input,
} from "@/components/ui";
import { findById } from "@/lib/data";
import { tenantsAtom } from "@/states";
import {
	UtilityProviderCategory as BillCategory,
	ConsolidatedBill,
	Tenant,
} from "@/types";

interface BillBreakdownProps {
	readonly consolidatedBill: ConsolidatedBill;
	readonly onWaterAmountChange?: (amount: number) => void;
	readonly selectedTenant?: Tenant | null;
}

export const BillBreakdown = ({
	consolidatedBill,
	onWaterAmountChange,
	selectedTenant,
}: BillBreakdownProps) => {
	const { categories } = consolidatedBill;
	const [tenantsList] = useAtom(tenantsAtom);
	const tenant =
		selectedTenant || findById(tenantsList, consolidatedBill.tenantId || "");

	const [isWaterDialogOpen, setIsWaterDialogOpen] = useState(false);
	const [waterAmountInput, setWaterAmountInput] = useState("");

	const handleResetWater = () => {
		if (onWaterAmountChange) {
			onWaterAmountChange(0);
		}
	};

	const handleManualWaterInput = () => {
		const amount = parseFloat(waterAmountInput);
		if (!isNaN(amount) && amount >= 0) {
			if (onWaterAmountChange) {
				onWaterAmountChange(amount);
			}
			setIsWaterDialogOpen(false);
			setWaterAmountInput("");
		}
	};

	const openWaterDialog = () => {
		setWaterAmountInput(categories.Water?.amount.toString() || "");
		setIsWaterDialogOpen(true);
	};

	return (
		<>
			<div className="flex flex-wrap gap-4">
				{Object.entries(categories).map(([categoryKey, bill]) => {
					const sharePercent =
						tenant?.shares?.[categoryKey as keyof typeof BillCategory] ?? 0;
					const tenantShare = bill.amount * (sharePercent / 100);

					return (
						<div
							key={bill.providerId}
							className="max-w-sm min-w-[220px] flex-1 rounded-lg border p-4"
							style={{ flexBasis: "300px" }}>
							<div className="mb-2 flex items-center justify-between">
								<h4 className="font-medium">{bill.providerName}</h4>
								<div className="flex items-center gap-1">
									{categoryKey === BillCategory.Electricity && (
										<Zap className="h-4 w-4 text-yellow-600" />
									)}
									{categoryKey === BillCategory.Water && (
										<>
											<Button
												variant="outline"
												size="sm"
												onClick={handleResetWater}
												className="h-6 w-6 p-0"
												title="Reset to 0">
												<RotateCcw className="h-3 w-3" />
											</Button>
											<Button
												variant="outline"
												size="sm"
												onClick={openWaterDialog}
												className="h-6 w-6 p-0"
												title="Manual input">
												<Edit className="h-3 w-3" />
											</Button>
											<Droplet className="h-4 w-4 text-blue-600" />
										</>
									)}
									{categoryKey === BillCategory.Gas && (
										<Flame className="h-4 w-4 text-red-600" />
									)}
								</div>
							</div>
							<p className="text-2xl font-bold">${bill.amount.toFixed(2)}</p>
							<p className="text-primary text-xs font-semibold">
								Tenant&apos;s share: ${tenantShare.toFixed(2)} ({sharePercent}%)
							</p>
						</div>
					);
				})}
			</div>

			{/* Water Amount Input Dialog */}
			<Dialog open={isWaterDialogOpen} onOpenChange={setIsWaterDialogOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Enter Water Bill Amount</DialogTitle>
						<DialogDescription>
							Enter the manual water bill amount for this month.
						</DialogDescription>
					</DialogHeader>
					<div className="space-y-4">
						<Input
							type="number"
							placeholder="Enter amount (e.g., 440.25)"
							value={waterAmountInput}
							onChange={(e) => setWaterAmountInput(e.target.value)}
							step="0.01"
							min="0"
						/>
						<div className="flex justify-end gap-2">
							<Button
								variant="outline"
								onClick={() => setIsWaterDialogOpen(false)}>
								Cancel
							</Button>
							<Button onClick={handleManualWaterInput}>Save Amount</Button>
						</div>
					</div>
				</DialogContent>
			</Dialog>
		</>
	);
};
