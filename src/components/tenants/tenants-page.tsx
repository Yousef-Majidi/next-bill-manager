"use client";

import { useState } from "react";

import { useAtom } from "jotai";
import {
	CreditCard,
	DollarSign,
	Edit,
	Mail,
	Percent,
	Plus,
	Trash2,
	TrendingDown,
	TrendingUp,
	Users,
} from "lucide-react";
import { toast } from "sonner";

import { DeleteDialog } from "@/components/common";
import { AddTenantDialog, EditTenantDialog } from "@/components/tenants";
import {
	Button,
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "@/components/ui";
import { DialogType, useDialogState } from "@/hooks";
import { safeExecuteAsync } from "@/lib/common/error-handling";
import { isObjectType } from "@/lib/common/type-utils";
import { addTenant, deleteTenant, updateTenant } from "@/lib/data";
import { tenantsAtom, userAtom } from "@/states";
import {
	Tenant,
	TenantFormData,
	UtilityProviderCategory as UtilityCategory,
} from "@/types";

export const TenantsPage = () => {
	const [tenants, setTenants] = useAtom(tenantsAtom);
	const [user] = useAtom(userAtom);
	const [editingTenant, setEditingTenant] = useState<Tenant | null>(null);
	const [editDialogOpen, setEditDialogOpen] = useState(false);

	const {
		mainDialogOpen,
		deleteDialogOpen,
		itemIdToDelete,
		setItemIdToDelete,
		toggleDialog,
	} = useDialogState();

	const handleAddTenant = async (newTenant: TenantFormData) => {
		if (!isObjectType(user)) return;

		const result = await safeExecuteAsync(async () => {
			const result = await addTenant(user.id, newTenant);
			if (result.acknowledged) {
				toast.success(`Tenant "${newTenant.name}" added successfully`);
				setTenants((prev) => [
					...prev,
					{
						id: result.insertedId,
						userId: user.id,
						name: newTenant.name,
						email: newTenant.email,
						...(newTenant.secondaryName
							? { secondaryName: newTenant.secondaryName }
							: {}),
						shares: {
							[UtilityCategory.Electricity]:
								newTenant.shares[UtilityCategory.Electricity] ?? 0,
							[UtilityCategory.Water]:
								newTenant.shares[UtilityCategory.Water] ?? 0,
							[UtilityCategory.Gas]: newTenant.shares[UtilityCategory.Gas] ?? 0,
						},
						outstandingBalance: 0,
					},
				]);
				toggleDialog(DialogType.MAIN);
				return result;
			}
			throw new Error("Failed to add tenant");
		});

		if (!result.success) {
			toast.error(
				result.error.message ||
					"An unexpected error occurred while adding the tenant",
			);
			console.error(result.error);
		}
	};

	const handleEditTenant = async (updatedTenant: TenantFormData) => {
		if (!isObjectType(user) || !isObjectType(editingTenant)) return;

		const result = await safeExecuteAsync(async () => {
			const result = await updateTenant(
				user.id,
				editingTenant.id,
				updatedTenant,
			);
			if (result.acknowledged) {
				toast.success(`Tenant "${updatedTenant.name}" updated successfully`);
				setTenants((prev) =>
					prev.map((t) =>
						t.id === editingTenant.id
							? {
									...t,
									name: updatedTenant.name,
									email: updatedTenant.email,
									...(updatedTenant.secondaryName
										? { secondaryName: updatedTenant.secondaryName }
										: {}),
									shares: {
										[UtilityCategory.Electricity]:
											updatedTenant.shares[UtilityCategory.Electricity] ?? 0,
										[UtilityCategory.Water]:
											updatedTenant.shares[UtilityCategory.Water] ?? 0,
										[UtilityCategory.Gas]:
											updatedTenant.shares[UtilityCategory.Gas] ?? 0,
									},
								}
							: t,
					),
				);
				setEditDialogOpen(false);
				setEditingTenant(null);
				return result;
			}
			throw new Error("Failed to update tenant");
		});

		if (!result.success) {
			toast.error(
				result.error.message ||
					"An unexpected error occurred while updating the tenant",
			);
			console.error(result.error);
		}
	};

	const handleDeleteTenant = async (tenantId: string) => {
		if (!isObjectType(user)) return;

		const result = await safeExecuteAsync(async () => {
			const result = await deleteTenant(user.id, tenantId);
			if (result.acknowledged) {
				toast.success("Tenant deleted successfully");
				setTenants((prev) => prev.filter((t) => t.id !== tenantId));
				return result;
			}
			throw new Error("Failed to delete tenant");
		});

		if (!result.success) {
			toast.error(
				result.error.message ||
					"An unexpected error occurred while deleting the tenant",
			);
			console.error(result.error);
		}
	};

	return (
		<div className="space-y-8">
			{/* Page Header */}
			<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
				<div className="space-y-1">
					<h1 className="text-foreground text-3xl font-bold tracking-tight">
						Tenants
					</h1>
					<p className="text-muted-foreground">
						Manage your tenants and their utility bill sharing percentages
					</p>
				</div>
				<Button onClick={() => toggleDialog(DialogType.MAIN)}>
					<Plus className="mr-2 h-4 w-4" />
					Add Tenant
				</Button>
			</div>

			{/* Stats Section */}
			{tenants.length > 0 && (
				<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
					<Card>
						<CardContent className="p-4">
							<div className="flex items-center gap-3">
								<div className="bg-primary/20 rounded-lg p-2">
									<Users className="text-primary h-5 w-5" />
								</div>
								<div>
									<p className="text-muted-foreground text-sm font-medium">
										Total Tenants
									</p>
									<p className="text-foreground text-2xl font-bold">
										{tenants.length}
									</p>
								</div>
							</div>
						</CardContent>
					</Card>
					<Card>
						<CardContent className="p-4">
							<div className="flex items-center gap-3">
								<div className="bg-primary/20 rounded-lg p-2">
									<TrendingDown className="text-primary h-5 w-5" />
								</div>
								<div>
									<p className="text-muted-foreground text-sm font-medium">
										With Credit
									</p>
									<p className="text-foreground text-2xl font-bold">
										{tenants.filter((t) => t.outstandingBalance < 0).length}
									</p>
								</div>
							</div>
						</CardContent>
					</Card>
					<Card>
						<CardContent className="p-4">
							<div className="flex items-center gap-3">
								<div className="bg-primary/20 rounded-lg p-2">
									<TrendingUp className="text-primary h-5 w-5" />
								</div>
								<div>
									<p className="text-muted-foreground text-sm font-medium">
										Outstanding
									</p>
									<p className="text-foreground text-2xl font-bold">
										{tenants.filter((t) => t.outstandingBalance > 0).length}
									</p>
								</div>
							</div>
						</CardContent>
					</Card>
					<Card>
						<CardContent className="p-4">
							<div className="flex items-center gap-3">
								<div className="bg-primary/20 rounded-lg p-2">
									<DollarSign className="text-primary h-5 w-5" />
								</div>
								<div>
									<p className="text-muted-foreground text-sm font-medium">
										Total Outstanding
									</p>
									<p className="text-foreground text-2xl font-bold">
										$
										{tenants
											.filter((t) => t.outstandingBalance > 0)
											.reduce((sum, t) => sum + t.outstandingBalance, 0)
											.toFixed(2)}
									</p>
								</div>
							</div>
						</CardContent>
					</Card>
				</div>
			)}

			{/* Tenants Grid */}
			<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
				{tenants.map((tenant) => (
					<Card
						key={tenant.id}
						className="group border-0 shadow-md transition-all duration-200 hover:shadow-lg">
						<CardHeader className="pb-3">
							<div className="flex items-start justify-between">
								<div className="flex items-center gap-3">
									<div className="bg-primary/20 flex h-12 w-12 items-center justify-center rounded-xl shadow-sm">
										<Users className="text-primary h-6 w-6" />
									</div>
									<div className="flex min-h-[4rem] flex-col justify-center space-y-1">
										<CardTitle className="text-foreground text-xl font-semibold">
											{tenant.name}
										</CardTitle>
										<div className="text-muted-foreground flex items-center gap-1 text-sm">
											<Mail className="h-3 w-3" />
											{tenant.email}
										</div>
										{tenant.secondaryName ? (
											<div className="text-muted-foreground flex items-center gap-1 text-xs">
												<Users className="h-3 w-3" />
												{tenant.secondaryName}
											</div>
										) : (
											<div className="h-4"></div>
										)}
									</div>
								</div>
								<div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
									<Button
										variant="ghost"
										size="sm"
										className="h-8 w-8 p-0"
										onClick={() => {
											setEditingTenant(tenant);
											setEditDialogOpen(true);
										}}>
										<Edit className="text-primary h-4 w-4" />
									</Button>
									<Button
										variant="ghost"
										size="sm"
										className="hover:bg-destructive/20 h-8 w-8 p-0"
										onClick={() => {
											setItemIdToDelete(tenant.id || null);
											toggleDialog(DialogType.DELETE);
										}}>
										<Trash2 className="text-destructive h-4 w-4" />
									</Button>
								</div>
							</div>
						</CardHeader>

						<CardContent className="space-y-4">
							{/* Balance Section */}
							<div
								className={`rounded-lg border-l-4 p-3 ${
									tenant.outstandingBalance < 0
										? "border-primary bg-primary/10"
										: tenant.outstandingBalance > 0
											? "border-destructive bg-destructive/10"
											: "border-border bg-muted"
								}`}>
								<div className="flex items-center justify-between">
									<div className="flex items-center gap-2">
										{tenant.outstandingBalance < 0 ? (
											<TrendingDown className="text-primary h-4 w-4" />
										) : tenant.outstandingBalance > 0 ? (
											<TrendingUp className="text-destructive h-4 w-4" />
										) : (
											<CreditCard className="text-muted-foreground h-4 w-4" />
										)}
										<span className="text-foreground text-sm font-medium">
											{tenant.outstandingBalance < 0
												? "Credit Balance"
												: tenant.outstandingBalance > 0
													? "Outstanding"
													: "Current"}
										</span>
									</div>
									<span
										className={`text-lg font-bold ${
											tenant.outstandingBalance < 0
												? "text-primary"
												: tenant.outstandingBalance > 0
													? "text-destructive"
													: "text-muted-foreground"
										}`}>
										{tenant.outstandingBalance < 0
											? `$${Math.abs(tenant.outstandingBalance).toFixed(2)}`
											: tenant.outstandingBalance > 0
												? `$${tenant.outstandingBalance.toFixed(2)}`
												: "$0.00"}
									</span>
								</div>
							</div>

							{/* Utility Shares Section */}
							<div className="space-y-3">
								<h4 className="text-foreground flex items-center gap-2 text-sm font-semibold">
									<Percent className="h-4 w-4" />
									Utility Shares
								</h4>
								<div className="grid grid-cols-1 gap-2">
									{Object.entries(tenant.shares).map(
										([category, percentage]) => (
											<div
												key={category}
												className="flex items-center justify-between">
												<span className="text-muted-foreground text-sm capitalize">
													{category.toLowerCase()}
												</span>
												<div className="flex items-center gap-2">
													<div className="bg-muted h-2 w-16 rounded-full">
														<div
															className="bg-primary h-2 rounded-full transition-all duration-300"
															style={{ width: `${percentage}%` }}></div>
													</div>
													<span className="text-foreground w-8 text-right text-sm font-medium">
														{percentage}%
													</span>
												</div>
											</div>
										),
									)}
								</div>
							</div>
						</CardContent>
					</Card>
				))}
			</div>

			{/* Empty State */}
			{tenants.length === 0 && (
				<div className="flex flex-col items-center justify-center px-4 py-16">
					<div className="bg-primary/20 mb-6 rounded-full p-6">
						<Users className="text-primary h-16 w-16" />
					</div>
					<div className="max-w-md space-y-4 text-center">
						<h3 className="text-foreground text-2xl font-semibold">
							No tenants yet
						</h3>
						<p className="text-muted-foreground leading-relaxed">
							Start by adding your first tenant to begin managing utility bill
							sharing and tracking payments.
						</p>
						<Button onClick={() => toggleDialog(DialogType.MAIN)}>
							<Plus className="mr-2 h-4 w-4" />
							Add Your First Tenant
						</Button>
					</div>
				</div>
			)}

			<AddTenantDialog
				isOpen={mainDialogOpen}
				onClose={() => toggleDialog(DialogType.MAIN)}
				onSubmit={handleAddTenant}
			/>

			<EditTenantDialog
				isOpen={editDialogOpen}
				onClose={() => {
					setEditDialogOpen(false);
					setEditingTenant(null);
				}}
				onSubmit={handleEditTenant}
				tenant={editingTenant}
			/>

			<DeleteDialog
				isOpen={deleteDialogOpen}
				title="Delete Tenant"
				description="Are you sure you want to delete this tenant? This action cannot be undone."
				onClose={() => toggleDialog(DialogType.DELETE)}
				onConfirm={() => {
					if (itemIdToDelete) {
						handleDeleteTenant(itemIdToDelete);
						setItemIdToDelete(null);
						toggleDialog(DialogType.DELETE);
					}
				}}
			/>
		</div>
	);
};
