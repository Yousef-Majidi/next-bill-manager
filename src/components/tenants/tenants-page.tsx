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
					<h1 className="text-3xl font-bold tracking-tight text-gray-900">
						Tenants
					</h1>
					<p className="text-gray-600">
						Manage your tenants and their utility bill sharing percentages
					</p>
				</div>
				<Button
					onClick={() => toggleDialog(DialogType.MAIN)}
					className="bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg transition-all duration-200 hover:from-blue-700 hover:to-purple-700 hover:shadow-xl">
					<Plus className="mr-2 h-4 w-4" />
					Add Tenant
				</Button>
			</div>

			{/* Stats Section */}
			{tenants.length > 0 && (
				<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
					<div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
						<div className="flex items-center gap-3">
							<div className="rounded-lg bg-blue-100 p-2">
								<Users className="h-5 w-5 text-blue-600" />
							</div>
							<div>
								<p className="text-sm font-medium text-gray-600">
									Total Tenants
								</p>
								<p className="text-2xl font-bold text-gray-900">
									{tenants.length}
								</p>
							</div>
						</div>
					</div>
					<div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
						<div className="flex items-center gap-3">
							<div className="rounded-lg bg-green-100 p-2">
								<TrendingDown className="h-5 w-5 text-green-600" />
							</div>
							<div>
								<p className="text-sm font-medium text-gray-600">With Credit</p>
								<p className="text-2xl font-bold text-gray-900">
									{tenants.filter((t) => t.outstandingBalance < 0).length}
								</p>
							</div>
						</div>
					</div>
					<div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
						<div className="flex items-center gap-3">
							<div className="rounded-lg bg-orange-100 p-2">
								<TrendingUp className="h-5 w-5 text-orange-600" />
							</div>
							<div>
								<p className="text-sm font-medium text-gray-600">Outstanding</p>
								<p className="text-2xl font-bold text-gray-900">
									{tenants.filter((t) => t.outstandingBalance > 0).length}
								</p>
							</div>
						</div>
					</div>
					<div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
						<div className="flex items-center gap-3">
							<div className="rounded-lg bg-purple-100 p-2">
								<DollarSign className="h-5 w-5 text-purple-600" />
							</div>
							<div>
								<p className="text-sm font-medium text-gray-600">
									Total Outstanding
								</p>
								<p className="text-2xl font-bold text-gray-900">
									$
									{tenants
										.filter((t) => t.outstandingBalance > 0)
										.reduce((sum, t) => sum + t.outstandingBalance, 0)
										.toFixed(2)}
								</p>
							</div>
						</div>
					</div>
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
									<div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 shadow-sm">
										<Users className="h-6 w-6 text-white" />
									</div>
									<div className="flex min-h-[4rem] flex-col justify-center space-y-1">
										<CardTitle className="text-xl font-semibold text-gray-900">
											{tenant.name}
										</CardTitle>
										<div className="flex items-center gap-1 text-sm text-gray-500">
											<Mail className="h-3 w-3" />
											{tenant.email}
										</div>
										{tenant.secondaryName ? (
											<div className="flex items-center gap-1 text-xs text-gray-400">
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
										className="h-8 w-8 p-0 hover:bg-blue-50"
										onClick={() => {
											setEditingTenant(tenant);
											setEditDialogOpen(true);
										}}>
										<Edit className="h-4 w-4 text-blue-600" />
									</Button>
									<Button
										variant="ghost"
										size="sm"
										className="h-8 w-8 p-0 hover:bg-red-50"
										onClick={() => {
											setItemIdToDelete(tenant.id || null);
											toggleDialog(DialogType.DELETE);
										}}>
										<Trash2 className="h-4 w-4 text-red-600" />
									</Button>
								</div>
							</div>
						</CardHeader>

						<CardContent className="space-y-4">
							{/* Balance Section */}
							<div
								className={`rounded-lg border-l-4 p-3 ${
									tenant.outstandingBalance < 0
										? "border-green-400 bg-green-50"
										: tenant.outstandingBalance > 0
											? "border-orange-400 bg-orange-50"
											: "border-gray-300 bg-gray-50"
								}`}>
								<div className="flex items-center justify-between">
									<div className="flex items-center gap-2">
										{tenant.outstandingBalance < 0 ? (
											<TrendingDown className="h-4 w-4 text-green-600" />
										) : tenant.outstandingBalance > 0 ? (
											<TrendingUp className="h-4 w-4 text-orange-600" />
										) : (
											<CreditCard className="h-4 w-4 text-gray-500" />
										)}
										<span
											className={`text-sm font-medium ${
												tenant.outstandingBalance < 0
													? "text-green-700"
													: tenant.outstandingBalance > 0
														? "text-orange-700"
														: "text-gray-600"
											}`}>
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
												? "text-green-600"
												: tenant.outstandingBalance > 0
													? "text-orange-600"
													: "text-gray-500"
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
								<h4 className="flex items-center gap-2 text-sm font-semibold text-gray-700">
									<Percent className="h-4 w-4" />
									Utility Shares
								</h4>
								<div className="grid grid-cols-1 gap-2">
									{Object.entries(tenant.shares).map(
										([category, percentage]) => (
											<div
												key={category}
												className="flex items-center justify-between">
												<span className="text-sm text-gray-600 capitalize">
													{category.toLowerCase()}
												</span>
												<div className="flex items-center gap-2">
													<div className="h-2 w-16 rounded-full bg-gray-200">
														<div
															className="h-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 transition-all duration-300"
															style={{ width: `${percentage}%` }}></div>
													</div>
													<span className="w-8 text-right text-sm font-medium text-gray-700">
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
					<div className="mb-6 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 p-6">
						<Users className="h-16 w-16 text-blue-600" />
					</div>
					<div className="max-w-md space-y-4 text-center">
						<h3 className="text-2xl font-semibold text-gray-900">
							No tenants yet
						</h3>
						<p className="leading-relaxed text-gray-600">
							Start by adding your first tenant to begin managing utility bill
							sharing and tracking payments.
						</p>
						<Button
							onClick={() => toggleDialog(DialogType.MAIN)}
							className="mt-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg transition-all duration-200 hover:from-blue-700 hover:to-purple-700 hover:shadow-xl">
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
