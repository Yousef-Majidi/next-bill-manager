"use client";

import { Dispatch, SetStateAction } from "react";

import { Mail } from "lucide-react";

import { BillBreakdown } from "@/components/dashboard";
import {
	Button,
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
	Separator,
} from "@/components/ui";
import { getTenantShares } from "@/lib/common/utils";
import { ConsolidatedBill, Tenant } from "@/types";

interface ConsolidatedBillSectionProps {
	readonly consolidatedBill: ConsolidatedBill;
	readonly tenantsList: Tenant[];
	readonly selectedTenant: Tenant | null;
	readonly setSelectedTenant: Dispatch<SetStateAction<Tenant | null>>;
	readonly handleSendBill: () => void;
}

export const ConsolidatedBillSection = ({
	consolidatedBill,
	tenantsList,
	selectedTenant,
	setSelectedTenant,
	handleSendBill,
}: ConsolidatedBillSectionProps) => {
	const tenantShares = selectedTenant
		? getTenantShares(consolidatedBill, selectedTenant)
		: null;

	return (
		<Card>
			<CardHeader>
				<CardTitle>Current Month Bill</CardTitle>
				<CardDescription>
					Breakdown of utility bills for the current month
				</CardDescription>
			</CardHeader>
			<CardContent>
				<div className="space-y-6">
					{/* Bill Breakdown */}
					{!consolidatedBill && (
						<p className="text-muted-foreground">
							No bills available for the current month.
						</p>
					)}
					{consolidatedBill && (
						<BillBreakdown consolidatedBill={consolidatedBill} />
					)}

					<Separator />

					{/* Total and Send Section */}
					<div className="flex items-center justify-between">
						<div>
							<h3 className="text-lg font-semibold">Total Bill Amount</h3>
							<p className="text-primary text-3xl font-bold">
								${consolidatedBill.totalAmount.toFixed(2)}
							</p>

							<p className="text-muted-foreground text-sm">
								Tenant&apos;s share: ${tenantShares?.tenantTotal.toFixed(2)}
							</p>
						</div>

						<div className="flex items-center gap-4">
							<Select
								value={selectedTenant?.id}
								onValueChange={(tenantId) => {
									const tenant = tenantsList.find((t) => t.id === tenantId);
									setSelectedTenant(tenant ?? null);
								}}>
								<SelectTrigger className="w-48">
									<SelectValue placeholder="Select tenant to bill" />
								</SelectTrigger>
								<SelectContent>
									{tenantsList.map((tenant) => (
										<SelectItem
											key={tenant.id}
											value={tenant.id || tenant.name}>
											{tenant.name}
										</SelectItem>
									))}
								</SelectContent>
							</Select>

							<Button
								onClick={() => {
									handleSendBill();
									// setEmailDialogOpen(true);
								}}
								disabled={!selectedTenant}>
								<Mail className="mr-2 h-4 w-4" />
								Send Bill
							</Button>
						</div>
					</div>
				</div>
			</CardContent>
		</Card>
	);
};
