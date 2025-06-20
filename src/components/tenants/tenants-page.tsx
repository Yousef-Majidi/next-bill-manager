"use client";

import { useAtom } from "jotai";
import { Mail, Percent, Plus, Trash2, Users } from "lucide-react";
import { toast } from "sonner";

import { DeleteDialog, PageHeader } from "@/components/common";
import { AddTenantDialog } from "@/components/tenants";
import {
	Badge,
	Button,
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "@/components/ui";
import { DialogType, useDialogState } from "@/hooks";
import { addTenant, deleteTenant } from "@/lib/data";
import { tenantsAtom, userAtom } from "@/states";
import {
	TenantFormData,
	UtilityProviderCategory as UtilityCategory,
} from "@/types";

export const TenantsPage = () => {
	const [tenants, setTenants] = useAtom(tenantsAtom);
	const [user] = useAtom(userAtom);

	const {
		mainDialogOpen,
		deleteDialogOpen,
		itemIdToDelete,
		setItemIdToDelete,
		toggleDialog,
	} = useDialogState();

	const handleAddTenant = async (newTenant: TenantFormData) => {
		if (!user) return;
		try {
			const result = await addTenant(user.id, {
				userId: user.id,
				name: newTenant.name,
				email: newTenant.email,
				shares: {
					[UtilityCategory.Electricity]:
						newTenant.shares[UtilityCategory.Electricity] ?? 0,
					[UtilityCategory.Water]: newTenant.shares[UtilityCategory.Water] ?? 0,
					[UtilityCategory.Gas]: newTenant.shares[UtilityCategory.Gas] ?? 0,
				},
			});
			if (result.acknowledged) {
				toast.success(`Tenant "${result.insertedName}" added successfully`);
				setTenants((prev) => [
					...prev,
					{
						id: result.insertedId,
						userId: user.id,
						name: newTenant.name,
						email: newTenant.email,
						shares: {
							[UtilityCategory.Electricity]:
								newTenant.shares[UtilityCategory.Electricity] ?? 0,
							[UtilityCategory.Water]:
								newTenant.shares[UtilityCategory.Water] ?? 0,
							[UtilityCategory.Gas]: newTenant.shares[UtilityCategory.Gas] ?? 0,
						},
					},
				]);
				toggleDialog(DialogType.MAIN);
				return;
			}
		} catch (error) {
			if (error instanceof Error) {
				toast.error(error.message);
				return;
			}

			toast.error("An unexpected error occurred while adding the tenant");
			console.error(error);
		}
	};

	const handleDeleteTenant = async (tenantId: string) => {
		if (!user) return;
		try {
			const result = await deleteTenant(user.id, tenantId);
			if (result.acknowledged) {
				toast.success("Tenant deleted successfully");
				setTenants((prev) => prev.filter((t) => t.id !== tenantId));
				return;
			}
		} catch (error) {
			if (error instanceof Error) {
				toast.error(error.message);
				return;
			}

			toast.error("An unexpected error occurred while deleting the tenant");
			console.error(error);
		}
	};

	return (
		<div className="flex flex-col gap-6">
			<div className="flex items-center justify-between">
				<PageHeader
					title="Tenants"
					subtitle={<p>Manage your tenants and their utility shares</p>}
				/>

				<Button onClick={() => toggleDialog(DialogType.MAIN)}>
					<Plus className="mr-2 h-4 w-4" />
					Add Tenant
				</Button>
			</div>

			<div className="grid gap-4 md:grid-cols-2">
				{tenants.map((tenant) => (
					<Card key={tenant.id}>
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
							<div className="flex items-center gap-3">
								<div className="bg-primary/10 flex h-10 w-10 items-center justify-center rounded-full">
									<Users className="h-5 w-5" />
								</div>
								<div>
									<CardTitle className="text-lg">{tenant.name}</CardTitle>
									<div className="text-muted-foreground flex items-center gap-1 text-sm">
										<Mail className="h-3 w-3" />
										{tenant.email}
									</div>
								</div>
							</div>
							<Button
								variant="ghost"
								size="sm"
								onClick={() => {
									setItemIdToDelete(tenant.id || null);
									toggleDialog(DialogType.DELETE);
								}}
								className="text-destructive hover:text-destructive">
								<Trash2 className="h-4 w-4" />
							</Button>
						</CardHeader>
						<CardContent>
							<div className="space-y-2">
								<div className="flex items-center justify-between text-sm">
									<span>{UtilityCategory.Electricity}</span>
									<Badge variant="outline">
										{tenant.shares[UtilityCategory.Electricity]}
										<Percent className="mr-1 h-3 w-3" />
									</Badge>
								</div>
								<div className="flex items-center justify-between text-sm">
									<span>{UtilityCategory.Water}</span>
									<Badge variant="outline">
										{tenant.shares[UtilityCategory.Water]}
										<Percent className="mr-1 h-3 w-3" />
									</Badge>
								</div>
								<div className="flex items-center justify-between text-sm">
									<span>{UtilityCategory.Gas}</span>
									<Badge variant="outline">
										{tenant.shares[UtilityCategory.Gas]}
										<Percent className="mr-1 h-3 w-3" />
									</Badge>
								</div>
							</div>
						</CardContent>
					</Card>
				))}
			</div>

			{tenants.length === 0 && (
				<Card>
					<CardContent className="flex flex-col items-center justify-center py-12">
						<Users className="text-muted-foreground mb-4 h-12 w-12" />
						<h3 className="mb-2 text-lg font-medium">No tenants added yet</h3>
						<p className="text-muted-foreground mb-4 text-center">
							Add your first tenant to start managing utility bill sharing
						</p>
						<Button onClick={() => toggleDialog(DialogType.MAIN)}>
							<Plus className="mr-2 h-4 w-4" />
							Add Tenant
						</Button>
					</CardContent>
				</Card>
			)}

			<AddTenantDialog
				isOpen={mainDialogOpen}
				onClose={() => toggleDialog(DialogType.MAIN)}
				onSubmit={handleAddTenant}
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
