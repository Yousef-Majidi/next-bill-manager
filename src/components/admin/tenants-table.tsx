"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { Edit, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { EditTenantDialog } from "@/components/admin/edit-tenant-dialog";
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
import { deleteTenant, updateTenant } from "@/lib/data";
import { Tenant } from "@/types";

interface TenantsTableProps {
	readonly tenants: Tenant[];
	readonly userId: string;
	readonly onUpdate: (tenants: Tenant[]) => void;
}

export function TenantsTable({ tenants, userId, onUpdate }: TenantsTableProps) {
	const router = useRouter();
	const [searchTerm, setSearchTerm] = useState("");
	const [editingTenant, setEditingTenant] = useState<Tenant | null>(null);
	const [deletingTenant, setDeletingTenant] = useState<Tenant | null>(null);

	const filteredTenants = tenants.filter((tenant) => {
		if (!searchTerm) return true;
		const searchLower = searchTerm.toLowerCase();
		return (
			tenant.name.toLowerCase().includes(searchLower) ||
			tenant.email.toLowerCase().includes(searchLower) ||
			(tenant.secondaryName &&
				tenant.secondaryName.toLowerCase().includes(searchLower))
		);
	});

	const handleEdit = (tenant: Tenant) => {
		setEditingTenant(tenant);
	};

	const handleDelete = (tenant: Tenant) => {
		setDeletingTenant(tenant);
	};

	const handleDeleteConfirm = async () => {
		if (!deletingTenant) return;

		try {
			await deleteTenant(userId, deletingTenant.id || "");
			toast.success("Tenant deleted successfully");
			onUpdate(tenants.filter((t) => t.id !== deletingTenant.id));
			setDeletingTenant(null);
			router.refresh();
		} catch (error) {
			toast.error(
				error instanceof Error ? error.message : "Failed to delete tenant",
			);
		}
	};

	const handleUpdate = async (
		tenantId: string,
		updateData: Parameters<typeof updateTenant>[2],
	) => {
		try {
			await updateTenant(userId, tenantId, updateData);
			toast.success("Tenant updated successfully");
			setEditingTenant(null);
			router.refresh();
		} catch (error) {
			toast.error(
				error instanceof Error ? error.message : "Failed to update tenant",
			);
		}
	};

	return (
		<>
			<div className="mb-4 flex items-center gap-4">
				<div className="relative flex-1">
					<Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
					<Input
						placeholder="Search tenants..."
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
							<TableHead>Name</TableHead>
							<TableHead>Email</TableHead>
							<TableHead>Secondary Name</TableHead>
							<TableHead className="text-right">Outstanding Balance</TableHead>
							<TableHead>Shares</TableHead>
							<TableHead className="text-right">Actions</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{filteredTenants.length === 0 ? (
							<TableRow>
								<TableCell
									colSpan={6}
									className="text-muted-foreground text-center">
									No tenants found
								</TableCell>
							</TableRow>
						) : (
							filteredTenants.map((tenant) => (
								<TableRow key={tenant.id}>
									<TableCell className="font-medium">{tenant.name}</TableCell>
									<TableCell>{tenant.email}</TableCell>
									<TableCell>{tenant.secondaryName || "-"}</TableCell>
									<TableCell className="text-right">
										<Badge
											variant={
												tenant.outstandingBalance > 0
													? "destructive"
													: tenant.outstandingBalance < 0
														? "default"
														: "outline"
											}>
											${tenant.outstandingBalance.toFixed(2)}
										</Badge>
									</TableCell>
									<TableCell>
										<div className="flex flex-wrap gap-1">
											{Object.entries(tenant.shares || {}).map(
												([key, value]) => (
													<Badge
														key={key}
														variant="outline"
														className="text-xs">
														{key}: {value}%
													</Badge>
												),
											)}
										</div>
									</TableCell>
									<TableCell className="text-right">
										<div className="flex justify-end gap-2">
											<Button
												variant="outline"
												size="sm"
												onClick={() => handleEdit(tenant)}>
												<Edit className="h-4 w-4" />
											</Button>
											<Button
												variant="outline"
												size="sm"
												onClick={() => handleDelete(tenant)}>
												<Trash2 className="text-destructive h-4 w-4" />
											</Button>
										</div>
									</TableCell>
								</TableRow>
							))
						)}
					</TableBody>
				</Table>
			</div>

			{editingTenant && (
				<EditTenantDialog
					tenant={editingTenant}
					userId={userId}
					onClose={() => setEditingTenant(null)}
					onSave={handleUpdate}
				/>
			)}

			{deletingTenant && (
				<DeleteDialog
					isOpen={true}
					title="Delete Tenant"
					description={`Are you sure you want to delete tenant "${deletingTenant.name}"?`}
					onClose={() => setDeletingTenant(null)}
					onConfirm={handleDeleteConfirm}
				/>
			)}
		</>
	);
}
