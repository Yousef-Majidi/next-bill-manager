"use client";

import { useAtom } from "jotai";
import { Droplets, Edit, Flame, Plus, Trash2, Zap } from "lucide-react";
import { toast } from "sonner";

import { DeleteDialog, PageHeader } from "@/components/common";
import { AddProviderDialog, EditProviderDialog } from "@/components/providers";
import {
	Badge,
	Button,
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "@/components/ui";
import { DialogType, useDialogState } from "@/hooks";
import { safeExecuteAsync } from "@/lib/common/error-handling";
import { isObjectType } from "@/lib/common/type-utils";
import {
	addUtilityProvider,
	deleteUtilityProvider,
	updateUtilityProvider,
} from "@/lib/data";
import { userAtom, utilityProvidersAtom } from "@/states";
import {
	UtilityProvider,
	UtilityProviderCategory,
	UtilityProviderFormData,
} from "@/types";

const categoryIcons = {
	Electricity: Zap,
	Water: Droplets,
	Gas: Flame,
};

const categoryColors = {
	Electricity: "bg-yellow-100 text-yellow-800",
	Water: "bg-blue-100 text-blue-800",
	Gas: "bg-orange-100 text-orange-800",
};

export const ProvidersPage = () => {
	const {
		mainDialogOpen,
		editDialogOpen,
		deleteDialogOpen,
		itemIdToDelete,
		itemToEdit,
		setItemIdToDelete,
		setItemToEdit,
		toggleDialog,
	} = useDialogState<UtilityProvider>();

	const [user] = useAtom(userAtom);
	const [providersList, setProvidersList] = useAtom(utilityProvidersAtom);

	const handleAddProvider = async (data: UtilityProviderFormData) => {
		if (!isObjectType(user)) return;

		const result = await safeExecuteAsync(async () => {
			const result = await addUtilityProvider(user.id, {
				id: "",
				userId: user.id,
				name: data.name,
				category: data.category as UtilityProviderCategory,
				...(data.email && { email: data.email }),
				...(data.website && { website: data.website }),
			});
			if (result.acknowledged) {
				toast.success(`Provider "${result.insertedName}" added successfully`);
				setProvidersList((prev) => [
					...prev,
					{
						id: result.insertedId,
						userId: user.id,
						name: data.name,
						category: data.category as UtilityProviderCategory,
						...(data.email && { email: data.email }),
						...(data.website && { website: data.website }),
					},
				]);
				toggleDialog(DialogType.MAIN);
				return result;
			}
			throw new Error("Failed to add provider");
		});

		if (!result.success) {
			toast.error(
				result.error.message ||
					"An unexpected error occurred while adding provider.",
			);
			console.error(result.error);
		}
	};

	const handleEditProvider = async (data: UtilityProviderFormData) => {
		if (!isObjectType(user) || !itemToEdit || !itemToEdit.id) return;

		const result = await safeExecuteAsync(async () => {
			const providerData = {
				id: itemToEdit.id!,
				userId: user.id,
				name: data.name,
				category: data.category as UtilityProviderCategory,
				...(data.email ? { email: data.email } : {}),
				...(data.website ? { website: data.website } : {}),
			} as UtilityProvider;

			const result = await updateUtilityProvider(
				user.id,
				itemToEdit.id!,
				providerData,
			);
			if (result.acknowledged) {
				toast.success(`Provider "${data.name}" updated successfully`);
				setProvidersList((prev) =>
					prev.map((p) =>
						p.id === itemToEdit.id
							? {
									id: p.id,
									userId: p.userId,
									name: data.name,
									category: data.category as UtilityProviderCategory,
									...(data.email ? { email: data.email } : {}),
									...(data.website ? { website: data.website } : {}),
								}
							: p,
					),
				);
				toggleDialog(DialogType.EDIT);
				setItemToEdit(null);
				return result;
			}
			throw new Error("Failed to update provider");
		});

		if (!result.success) {
			toast.error(
				result.error.message ||
					"An unexpected error occurred while updating provider.",
			);
			console.error(result.error);
		}
	};

	const handleDeleteProvider = async (providerId: string) => {
		if (!isObjectType(user)) return;

		const result = await safeExecuteAsync(async () => {
			const result = await deleteUtilityProvider(user.id, providerId);
			if (result.acknowledged) {
				toast.success(
					`${result.deletedCount} provider(s) deleted successfully`,
				);
				toggleDialog(DialogType.DELETE);
				setProvidersList(providersList.filter((p) => p.id !== providerId));
				setItemIdToDelete(null);
				return result;
			}
			throw new Error("Failed to delete provider");
		});

		if (!result.success) {
			toast.error(
				result.error.message ||
					"An unexpected error occurred while deleting provider.",
			);
			console.error(result.error);
		}
	};

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<PageHeader
					title="Utility Providers"
					subtitle={<p>Manage your utility service providers</p>}
				/>

				<Button onClick={() => toggleDialog(DialogType.MAIN)}>
					<Plus className="mr-2 h-4 w-4" />
					Add Provider
				</Button>
			</div>

			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
				{providersList.map((provider) => (
					<Card key={provider.id}>
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<div className="flex items-center gap-2">
								{(() => {
									const Icon =
										categoryIcons[
											provider.category as keyof typeof categoryIcons
										];
									return Icon ? <Icon className="h-5 w-5" /> : null;
								})()}
								<CardTitle className="text-lg">{provider.name}</CardTitle>
								<Badge
									className={
										categoryColors[
											provider.category as keyof typeof categoryColors
										]
									}>
									{provider.category.charAt(0).toUpperCase() +
										provider.category.slice(1)}
								</Badge>
							</div>
							<div className="flex gap-1">
								<Button
									variant="ghost"
									size="sm"
									onClick={() => {
										setItemToEdit(provider);
										toggleDialog(DialogType.EDIT);
									}}
									className="text-muted-foreground hover:text-foreground">
									<Edit className="h-4 w-4" />
								</Button>
								<Button
									variant="ghost"
									size="sm"
									onClick={() => {
										setItemIdToDelete(provider.id || null);
										toggleDialog(DialogType.DELETE);
									}}
									className="text-destructive hover:text-destructive">
									<Trash2 className="h-4 w-4" />
								</Button>
							</div>
						</CardHeader>
						<CardContent className="space-y-3">
							{(provider.email || provider.website) && (
								<div className="text-muted-foreground space-y-2 text-sm">
									{provider.email && (
										<div className="flex items-center gap-2">
											<span className="font-medium">Email:</span>
											<a
												href={`mailto:${provider.email}`}
												className="text-blue-600 hover:underline">
												{provider.email}
											</a>
										</div>
									)}
									{provider.website && (
										<div className="flex items-center gap-2">
											<span className="font-medium">Website:</span>
											<a
												href={provider.website}
												target="_blank"
												rel="noopener noreferrer"
												className="text-blue-600 hover:underline">
												{provider.website}
											</a>
										</div>
									)}
								</div>
							)}
						</CardContent>
					</Card>
				))}
			</div>

			<AddProviderDialog
				isOpen={mainDialogOpen}
				onClose={() => toggleDialog(DialogType.MAIN)}
				onSubmit={handleAddProvider}
			/>

			{itemToEdit && itemToEdit.id && (
				<EditProviderDialog
					isOpen={editDialogOpen}
					onClose={() => {
						toggleDialog(DialogType.EDIT);
						setItemToEdit(null);
					}}
					onSubmit={handleEditProvider}
					provider={
						itemToEdit as {
							readonly id: string;
							readonly name: string;
							readonly category: string;
							readonly email?: string;
							readonly website?: string;
						}
					}
				/>
			)}

			<DeleteDialog
				isOpen={deleteDialogOpen}
				title="Delete Provider"
				description="Are you sure you want to delete this provider? This action cannot be undone."
				onClose={() => toggleDialog(DialogType.DELETE)}
				onConfirm={async () => {
					if (itemIdToDelete) {
						await handleDeleteProvider(itemIdToDelete);
					}
				}}
			/>
			{providersList.length === 0 && (
				<Card>
					<CardContent className="flex flex-col items-center justify-center py-12">
						<Zap className="text-muted-foreground mb-4 h-12 w-12" />
						<h3 className="mb-2 text-lg font-medium">No providers added yet</h3>
						<p className="text-muted-foreground mb-4 text-center">
							Add your first utility provider to get started with bill
							management
						</p>
						<Button onClick={() => toggleDialog(DialogType.MAIN)}>
							<Plus className="mr-2 h-4 w-4" />
							Add Provider
						</Button>
					</CardContent>
				</Card>
			)}
		</div>
	);
};
