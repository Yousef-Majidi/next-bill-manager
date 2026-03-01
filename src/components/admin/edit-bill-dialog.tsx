"use client";

import { useEffect } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { Edit } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import {
	Button,
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	Input,
	Label,
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
	Switch,
} from "@/components/ui";
import { updateConsolidatedBill } from "@/lib/data/actions";
import { ConsolidatedBill, Tenant } from "@/types";

const billFormSchema = z.object({
	year: z.number().min(2020).max(2030),
	month: z.number().min(1).max(12),
	tenantId: z.string().nullable(),
	totalAmount: z.number().min(0),
	paid: z.boolean(),
	dateSent: z.string().nullable(),
	datePaid: z.string().nullable(),
	paymentMessageId: z.string().optional(),
});

type BillFormData = z.infer<typeof billFormSchema>;

interface EditBillDialogProps {
	readonly bill: ConsolidatedBill;
	readonly tenants: Tenant[];
	readonly onClose: () => void;
	readonly onSave: (
		billId: string,
		updateData: Parameters<typeof updateConsolidatedBill>[2],
	) => Promise<void>;
}

export function EditBillDialog({
	bill,
	tenants,
	onClose,
	onSave,
}: EditBillDialogProps) {
	const {
		register,
		handleSubmit,
		formState: { errors },
		setValue,
		watch,
	} = useForm<BillFormData>({
		resolver: zodResolver(billFormSchema),
		defaultValues: {
			year: bill.year,
			month: bill.month,
			tenantId: bill.tenantId || null,
			totalAmount: bill.totalAmount,
			paid: bill.paid,
			dateSent: bill.dateSent || null,
			datePaid: bill.datePaid || null,
			paymentMessageId: bill.paymentMessageId || undefined,
		},
	});

	const paid = watch("paid");

	useEffect(() => {
		setValue("year", bill.year);
		setValue("month", bill.month);
		setValue("tenantId", bill.tenantId || null);
		setValue("totalAmount", bill.totalAmount);
		setValue("paid", bill.paid);
		setValue("dateSent", bill.dateSent || null);
		setValue("datePaid", bill.datePaid || null);
		setValue("paymentMessageId", bill.paymentMessageId || undefined);
	}, [bill, setValue]);

	const onSubmit = async (data: BillFormData) => {
		const updateData: Parameters<typeof updateConsolidatedBill>[2] = {
			year: data.year,
			month: data.month,
			tenantId: data.tenantId,
			totalAmount: data.totalAmount,
			paid: data.paid,
			dateSent: data.dateSent || null,
			datePaid: data.datePaid || null,
		};
		if (data.paymentMessageId) {
			updateData.paymentMessageId = data.paymentMessageId;
		}
		await onSave(bill.id || "", updateData);
	};

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

	return (
		<Dialog open={true} onOpenChange={onClose}>
			<DialogContent className="max-w-2xl">
				<DialogHeader className="space-y-3">
					<div className="flex items-center gap-3">
						<div className="from-primary/30 via-primary/20 to-primary/10 border-primary/20 rounded-xl border bg-gradient-to-br p-3">
							<Edit className="text-primary h-6 w-6" />
						</div>
						<div>
							<DialogTitle className="text-foreground text-xl font-semibold">
								Edit Bill
							</DialogTitle>
							<DialogDescription className="text-muted-foreground">
								Update bill information for {monthNames[bill.month - 1]}{" "}
								{bill.year}
							</DialogDescription>
						</div>
					</div>
				</DialogHeader>
				<form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
					<div className="grid gap-4 md:grid-cols-2">
						<div>
							<Label htmlFor="year">Year</Label>
							<Input
								id="year"
								type="number"
								{...register("year", { valueAsNumber: true })}
								min={2020}
								max={2030}
							/>
							{errors.year && (
								<p className="text-destructive mt-1 text-sm">
									{errors.year.message}
								</p>
							)}
						</div>

						<div>
							<Label htmlFor="month">Month</Label>
							<Select
								value={watch("month").toString()}
								onValueChange={(value) =>
									setValue("month", parseInt(value, 10))
								}>
								<SelectTrigger>
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									{monthNames.map((name, index) => (
										<SelectItem key={index} value={(index + 1).toString()}>
											{name}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>

						<div>
							<Label htmlFor="tenantId">Tenant</Label>
							<Select
								value={watch("tenantId") || "__none__"}
								onValueChange={(value) =>
									setValue("tenantId", value === "__none__" ? null : value)
								}>
								<SelectTrigger>
									<SelectValue placeholder="Select tenant" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="__none__">No tenant</SelectItem>
									{tenants.map((tenant) => (
										<SelectItem key={tenant.id} value={tenant.id || ""}>
											{tenant.name}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>

						<div>
							<Label htmlFor="totalAmount">Total Amount</Label>
							<Input
								id="totalAmount"
								type="number"
								step="0.01"
								{...register("totalAmount", { valueAsNumber: true })}
								min={0}
							/>
							{errors.totalAmount && (
								<p className="text-destructive mt-1 text-sm">
									{errors.totalAmount.message}
								</p>
							)}
						</div>

						<div className="flex items-center gap-2">
							<Switch
								checked={paid}
								onCheckedChange={(checked) => setValue("paid", checked)}
							/>
							<Label htmlFor="paid">Paid</Label>
						</div>

						<div>
							<Label htmlFor="dateSent">Date Sent</Label>
							<Input
								id="dateSent"
								type="date"
								{...register("dateSent")}
								value={
									watch("dateSent")
										? (() => {
												// Extract date from ISO string without timezone conversion
												const dateStr = watch("dateSent")!;
												if (dateStr.includes("T")) {
													return dateStr.split("T")[0];
												}
												// Fallback: if it's not ISO format, try parsing
												const date = new Date(dateStr);
												if (!isNaN(date.getTime())) {
													const year = date.getUTCFullYear();
													const month = String(date.getUTCMonth() + 1).padStart(
														2,
														"0",
													);
													const day = String(date.getUTCDate()).padStart(
														2,
														"0",
													);
													return `${year}-${month}-${day}`;
												}
												return "";
											})()
										: ""
								}
								onChange={(e) => {
									if (e.target.value) {
										// Create date at local midnight to avoid timezone issues
										const parts = e.target.value.split("-").map(Number);
										if (parts.length === 3 && parts.every((p) => !isNaN(p))) {
											const year = parts[0]!;
											const month = parts[1]!;
											const day = parts[2]!;
											const localDate = new Date(year, month - 1, day);
											setValue("dateSent", localDate.toISOString());
										}
									} else {
										setValue("dateSent", null);
									}
								}}
							/>
						</div>

						<div>
							<Label htmlFor="datePaid">Date Paid</Label>
							<Input
								id="datePaid"
								type="date"
								{...register("datePaid")}
								value={
									watch("datePaid")
										? (() => {
												// Extract date from ISO string without timezone conversion
												const dateStr = watch("datePaid")!;
												if (dateStr.includes("T")) {
													return dateStr.split("T")[0];
												}
												// Fallback: if it's not ISO format, try parsing
												const date = new Date(dateStr);
												if (!isNaN(date.getTime())) {
													const year = date.getUTCFullYear();
													const month = String(date.getUTCMonth() + 1).padStart(
														2,
														"0",
													);
													const day = String(date.getUTCDate()).padStart(
														2,
														"0",
													);
													return `${year}-${month}-${day}`;
												}
												return "";
											})()
										: ""
								}
								onChange={(e) => {
									if (e.target.value) {
										// Create date at local midnight to avoid timezone issues
										const parts = e.target.value.split("-").map(Number);
										if (parts.length === 3 && parts.every((p) => !isNaN(p))) {
											const year = parts[0]!;
											const month = parts[1]!;
											const day = parts[2]!;
											const localDate = new Date(year, month - 1, day);
											setValue("datePaid", localDate.toISOString());
										}
									} else {
										setValue("datePaid", null);
									}
								}}
							/>
						</div>

						<div>
							<Label htmlFor="paymentMessageId">Payment Message ID</Label>
							<Input
								id="paymentMessageId"
								{...register("paymentMessageId")}
								placeholder="Gmail message ID"
							/>
						</div>
					</div>

					<DialogFooter className="gap-3">
						<Button type="button" variant="outline" onClick={onClose}>
							Cancel
						</Button>
						<Button type="submit">Update Bill</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
