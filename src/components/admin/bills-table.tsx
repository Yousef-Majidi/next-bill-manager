"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { Edit, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { EditBillDialog } from "@/components/admin/edit-bill-dialog";
import { DeleteDialog } from "@/components/common";
import {
	Badge,
	Button,
	Input,
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui";
import { findById } from "@/lib/data";
import {
	deleteConsolidatedBill,
	updateConsolidatedBill,
} from "@/lib/data/actions";
import { ConsolidatedBill, Tenant } from "@/types";

interface BillsTableProps {
	readonly bills: ConsolidatedBill[];
	readonly tenants: Tenant[];
	readonly userId: string;
	readonly onUpdate: (bills: ConsolidatedBill[]) => void;
}

export function BillsTable({
	bills,
	tenants,
	userId,
	onUpdate,
}: BillsTableProps) {
	const router = useRouter();
	const [searchTerm, setSearchTerm] = useState("");
	const [editingBill, setEditingBill] = useState<ConsolidatedBill | null>(null);
	const [deletingBill, setDeletingBill] = useState<ConsolidatedBill | null>(
		null,
	);

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

	const filteredBills = bills.filter((bill) => {
		if (!searchTerm) return true;
		const searchLower = searchTerm.toLowerCase();
		const tenant = findById(tenants, bill.tenantId || "");
		const tenantName = tenant?.name.toLowerCase() || "";
		const monthName = monthNames[bill.month - 1]?.toLowerCase() || "";
		return (
			monthName.includes(searchLower) ||
			tenantName.includes(searchLower) ||
			bill.year.toString().includes(searchLower) ||
			bill.totalAmount.toString().includes(searchLower)
		);
	});

	const handleEdit = (bill: ConsolidatedBill) => {
		setEditingBill(bill);
	};

	const handleDelete = (bill: ConsolidatedBill) => {
		setDeletingBill(bill);
	};

	const handleDeleteConfirm = async () => {
		if (!deletingBill) return;

		try {
			await deleteConsolidatedBill(userId, deletingBill.id || "");
			toast.success("Bill deleted successfully");
			onUpdate(bills.filter((b) => b.id !== deletingBill.id));
			setDeletingBill(null);
			router.refresh();
		} catch (error) {
			toast.error(
				error instanceof Error ? error.message : "Failed to delete bill",
			);
		}
	};

	const handleUpdate = async (
		billId: string,
		updateData: Parameters<typeof updateConsolidatedBill>[2],
	) => {
		try {
			await updateConsolidatedBill(userId, billId, updateData);
			toast.success("Bill updated successfully");
			setEditingBill(null);
			// Refresh the page data
			router.refresh();
		} catch (error) {
			toast.error(
				error instanceof Error ? error.message : "Failed to update bill",
			);
		}
	};

	return (
		<>
			<div className="mb-4 flex items-center gap-4">
				<div className="relative flex-1">
					<Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
					<Input
						placeholder="Search bills..."
						value={searchTerm}
						onChange={(e) => setSearchTerm(e.target.value)}
						className="pl-10"
					/>
				</div>
			</div>

			<div className="rounded-md border">
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>Year</TableHead>
							<TableHead>Month</TableHead>
							<TableHead>Tenant</TableHead>
							<TableHead className="text-right">Total Amount</TableHead>
							<TableHead>Paid Status</TableHead>
							<TableHead>Date Sent</TableHead>
							<TableHead>Date Paid</TableHead>
							<TableHead>Payment Message ID</TableHead>
							<TableHead className="text-right">Actions</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{filteredBills.length === 0 ? (
							<TableRow>
								<TableCell
									colSpan={9}
									className="text-muted-foreground text-center">
									No bills found
								</TableCell>
							</TableRow>
						) : (
							filteredBills.map((bill) => {
								const tenant = findById(tenants, bill.tenantId || "");
								return (
									<TableRow key={bill.id}>
										<TableCell>{bill.year}</TableCell>
										<TableCell>{monthNames[bill.month - 1]}</TableCell>
										<TableCell>{tenant?.name || "No tenant"}</TableCell>
										<TableCell className="text-right font-medium">
											${bill.totalAmount.toFixed(2)}
										</TableCell>
										<TableCell>
											<Badge variant={bill.paid ? "default" : "destructive"}>
												{bill.paid ? "Paid" : "Unpaid"}
											</Badge>
										</TableCell>
										<TableCell>
											{bill.dateSent
												? (() => {
														// Extract date from ISO string without timezone conversion
														const dateStr = bill.dateSent;
														if (dateStr.includes("T")) {
															return dateStr.split("T")[0];
														}
														return dateStr;
													})()
												: "-"}
										</TableCell>
										<TableCell>
											{bill.datePaid
												? (() => {
														// Extract date from ISO string without timezone conversion
														const dateStr = bill.datePaid;
														if (dateStr.includes("T")) {
															return dateStr.split("T")[0];
														}
														return dateStr;
													})()
												: "-"}
										</TableCell>
										<TableCell>
											{bill.paymentMessageId ? (
												<span className="text-muted-foreground font-mono text-xs">
													{bill.paymentMessageId}
												</span>
											) : (
												<span className="text-muted-foreground">-</span>
											)}
										</TableCell>
										<TableCell className="text-right">
											<div className="flex justify-end gap-2">
												<Button
													variant="outline"
													size="sm"
													onClick={() => handleEdit(bill)}>
													<Edit className="h-4 w-4" />
												</Button>
												<Button
													variant="outline"
													size="sm"
													onClick={() => handleDelete(bill)}>
													<Trash2 className="text-destructive h-4 w-4" />
												</Button>
											</div>
										</TableCell>
									</TableRow>
								);
							})
						)}
					</TableBody>
				</Table>
			</div>

			{editingBill && (
				<EditBillDialog
					bill={editingBill}
					tenants={tenants}
					onClose={() => setEditingBill(null)}
					onSave={handleUpdate}
				/>
			)}

			{deletingBill && (
				<DeleteDialog
					isOpen={true}
					title="Delete Bill"
					description={`Are you sure you want to delete the bill for ${monthNames[deletingBill.month - 1]} ${deletingBill.year}?`}
					onClose={() => setDeletingBill(null)}
					onConfirm={handleDeleteConfirm}
				/>
			)}
		</>
	);
}
