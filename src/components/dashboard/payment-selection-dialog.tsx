"use client";

import { useState } from "react";

import { Calendar, DollarSign } from "lucide-react";
import { toast } from "sonner";

import {
	Button,
	Checkbox,
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	Label,
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui";
import { getTenantShares, roundToCurrency } from "@/lib/common/utils";
import { applyPaymentToBills } from "@/lib/gmail/actions";
import { ConsolidatedBill, Payment, Tenant } from "@/types";

interface PaymentSelectionDialogProps {
	readonly isOpen: boolean;
	readonly tenant: Tenant;
	readonly payment: Payment;
	readonly unpaidBills: ConsolidatedBill[];
	readonly userId: string;
	readonly onClose: () => void;
	readonly onSuccess: () => void;
}

const monthNames = [
	"January",
	"February",
	"March",
	"April",
	"May",
	"June",
	"July",
	"August",
	"September",
	"October",
	"November",
	"December",
];

export const PaymentSelectionDialog: React.FC<PaymentSelectionDialogProps> = ({
	isOpen,
	tenant,
	payment,
	unpaidBills,
	userId,
	onClose,
	onSuccess,
}) => {
	const [selectedBillIds, setSelectedBillIds] = useState<Set<string>>(
		new Set(),
	);
	const [isProcessing, setIsProcessing] = useState(false);

	const paymentAmount = roundToCurrency(Number(payment.amount));

	// Calculate amounts for each bill
	const billAmounts = unpaidBills.map((bill) => {
		const { tenantTotal } = getTenantShares(bill, tenant);
		// For the first bill in the list, include outstanding balance
		const isFirstBill = bill === unpaidBills[0];
		const expectedAmount = isFirstBill
			? tenantTotal + tenant.outstandingBalance
			: tenantTotal;
		return {
			bill,
			tenantTotal,
			expectedAmount,
		};
	});

	// Calculate total selected amount
	const totalSelectedAmount = Array.from(selectedBillIds).reduce(
		(sum, billId) => {
			const billAmount = billAmounts.find((ba) => ba.bill.id === billId);
			return sum + (billAmount?.expectedAmount || 0);
		},
		0,
	);

	const difference = paymentAmount - totalSelectedAmount;
	const isExact = Math.abs(difference) <= 0.01;
	const isOverpaid = difference > 0.01;

	const handleToggleBill = (billId: string) => {
		const newSelected = new Set(selectedBillIds);
		if (newSelected.has(billId)) {
			newSelected.delete(billId);
		} else {
			newSelected.add(billId);
		}
		setSelectedBillIds(newSelected);
	};

	const handleApplyPayment = async () => {
		if (selectedBillIds.size === 0) {
			toast.error("Please select at least one bill");
			return;
		}

		setIsProcessing(true);
		try {
			const result = await applyPaymentToBills(
				userId,
				tenant,
				payment,
				Array.from(selectedBillIds),
			);

			if (result.success) {
				toast.success(result.message);
				onSuccess();
				onClose();
			} else {
				toast.error("Failed to apply payment");
			}
		} catch (error) {
			toast.error(
				error instanceof Error ? error.message : "Failed to apply payment",
			);
		} finally {
			setIsProcessing(false);
		}
	};

	const handleSkip = () => {
		onClose();
	};

	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
				<DialogHeader className="space-y-3">
					<div className="flex items-center gap-3">
						<div className="bg-primary/20 rounded-xl p-3">
							<DollarSign className="text-primary h-6 w-6" />
						</div>
						<div>
							<DialogTitle className="text-foreground text-xl font-semibold">
								Payment Detected
							</DialogTitle>
							<DialogDescription className="text-muted-foreground">
								Select which bills this payment applies to
							</DialogDescription>
						</div>
					</div>
				</DialogHeader>

				<div className="space-y-6">
					{/* Payment Details */}
					<div className="bg-muted rounded-lg border p-4">
						<div className="grid grid-cols-2 gap-4">
							<div>
								<Label className="text-muted-foreground text-sm font-medium">
									Payment Amount
								</Label>
								<p className="text-foreground text-2xl font-bold">
									${paymentAmount.toFixed(2)}
								</p>
							</div>
							<div>
								<Label className="text-muted-foreground text-sm font-medium">
									From
								</Label>
								<p className="text-foreground text-lg font-medium">
									{payment.sentFrom}
								</p>
							</div>
							<div>
								<Label className="text-muted-foreground text-sm font-medium">
									Date
								</Label>
								<div className="flex items-center gap-2">
									<Calendar className="text-muted-foreground h-4 w-4" />
									<p className="text-foreground text-sm">
										{payment.date
											? new Date(payment.date).toLocaleDateString()
											: "Unknown"}
									</p>
								</div>
							</div>
							<div>
								<Label className="text-sm font-medium text-gray-500">
									Tenant
								</Label>
								<p className="text-lg font-medium text-gray-900">
									{tenant.name}
								</p>
							</div>
						</div>
					</div>

					{/* Unpaid Bills List */}
					<div>
						<Label className="text-base font-semibold text-gray-900">
							Unpaid Bills
						</Label>
						<p className="mb-3 text-sm text-gray-500">
							Select the bills this payment applies to
						</p>
						<div className="rounded-md border">
							<Table>
								<TableHeader>
									<TableRow>
										<TableHead className="w-12">
											<Checkbox
												checked={
													selectedBillIds.size === unpaidBills.length &&
													unpaidBills.length > 0
												}
												onCheckedChange={(checked) => {
													if (checked) {
														setSelectedBillIds(
															new Set(
																unpaidBills
																	.map((b) => b.id)
																	.filter((id): id is string => id !== null),
															),
														);
													} else {
														setSelectedBillIds(new Set());
													}
												}}
											/>
										</TableHead>
										<TableHead>Month/Year</TableHead>
										<TableHead>Your Share</TableHead>
										<TableHead className="text-right">Total Bill</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{unpaidBills.length === 0 ? (
										<TableRow>
											<TableCell
												colSpan={4}
												className="text-muted-foreground text-center">
												No unpaid bills found
											</TableCell>
										</TableRow>
									) : (
										billAmounts.map(({ bill, tenantTotal }) => {
											const billId = bill.id || "";
											const isSelected = selectedBillIds.has(billId);
											const isFirstBill = bill === unpaidBills[0];

											return (
												<TableRow key={billId}>
													<TableCell>
														<Checkbox
															checked={isSelected}
															onCheckedChange={() => handleToggleBill(billId)}
														/>
													</TableCell>
													<TableCell className="font-medium">
														{monthNames[bill.month - 1]} {bill.year}
														{isFirstBill && tenant.outstandingBalance > 0 && (
															<span className="ml-2 text-xs text-gray-500">
																(+ ${tenant.outstandingBalance.toFixed(2)}{" "}
																balance)
															</span>
														)}
													</TableCell>
													<TableCell>
														${tenantTotal.toFixed(2)}
														{isFirstBill && tenant.outstandingBalance > 0 && (
															<span className="text-xs text-gray-500">
																{" "}
																+ ${tenant.outstandingBalance.toFixed(2)}
															</span>
														)}
													</TableCell>
													<TableCell className="text-right font-medium">
														${bill.totalAmount.toFixed(2)}
													</TableCell>
												</TableRow>
											);
										})
									)}
								</TableBody>
							</Table>
						</div>
					</div>

					{/* Summary */}
					{selectedBillIds.size > 0 && (
						<div className="rounded-lg border bg-blue-50 p-4">
							<div className="space-y-2">
								<div className="flex items-center justify-between">
									<Label className="text-sm font-medium text-gray-700">
										Selected Bills Total:
									</Label>
									<span className="text-lg font-semibold text-gray-900">
										${totalSelectedAmount.toFixed(2)}
									</span>
								</div>
								<div className="flex items-center justify-between">
									<Label className="text-sm font-medium text-gray-700">
										Payment Amount:
									</Label>
									<span className="text-lg font-semibold text-gray-900">
										${paymentAmount.toFixed(2)}
									</span>
								</div>
								<div className="border-t pt-2">
									<div className="flex items-center justify-between">
										<Label className="text-sm font-medium text-gray-700">
											Difference:
										</Label>
										<span
											className={`text-lg font-semibold ${
												isExact
													? "text-green-600"
													: isOverpaid
														? "text-blue-600"
														: "text-orange-600"
											}`}>
											{isExact
												? "Exact match"
												: isOverpaid
													? `+$${Math.abs(difference).toFixed(2)} (credit)`
													: `-$${Math.abs(difference).toFixed(2)} (remaining)`}
										</span>
									</div>
								</div>
							</div>
						</div>
					)}
				</div>

				<DialogFooter className="gap-3">
					<Button type="button" variant="outline" onClick={handleSkip}>
						Skip
					</Button>
					<Button
						type="button"
						onClick={handleApplyPayment}
						disabled={selectedBillIds.size === 0 || isProcessing}>
						{isProcessing ? "Processing..." : "Apply Payment"}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};
