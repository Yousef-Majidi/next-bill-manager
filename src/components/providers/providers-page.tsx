"use client";

import { useAtom } from "jotai";
import {
	Building2,
	Droplets,
	Edit,
	Flame,
	Globe,
	Mail,
	Plus,
	Router,
	Trash2,
	Zap,
} from "lucide-react";
import { toast } from "sonner";

import { DeleteDialog } from "@/components/common";
import { AddProviderDialog, EditProviderDialog } from "@/components/providers";
import { Badge, Button, Card, CardContent } from "@/components/ui";
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
	Internet: Router,
	OTHER: Building2,
};

const categoryColors = {
	Electricity: "bg-[oklch(0.20_0.02_60)] text-[oklch(0.70_0.18_60)]",
	Water: "bg-[oklch(0.20_0.02_200)] text-[oklch(0.70_0.18_200)]",
	Gas: "bg-[oklch(0.20_0.02_25)] text-[oklch(0.70_0.18_25)]",
	Internet: "bg-[oklch(0.20_0.02_280)] text-[oklch(0.70_0.18_280)]",
	OTHER: "bg-muted text-muted-foreground",
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

	// Calculate stats
	const totalProviders = providersList.length;
	const electricityProviders = providersList.filter(
		(p) => p.category === "Electricity",
	).length;
	const waterProviders = providersList.filter(
		(p) => p.category === "Water",
	).length;
	const gasProviders = providersList.filter((p) => p.category === "Gas").length;

	return (
		<div className="space-y-8">
			{/* Page Header */}
			<div className="space-y-1">
				<h1 className="text-foreground text-3xl font-bold tracking-tight">
					Utility Providers
				</h1>
				<p className="text-muted-foreground">
					Manage your utility service providers
				</p>
			</div>

			{/* Header with Stats and Action */}
			<div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
				{/* Compact Stats */}
				<div className="flex items-center gap-6">
					<div className="flex items-center gap-3">
						<div className="bg-primary/20 rounded-lg p-2">
							<Building2 className="text-primary h-5 w-5" />
						</div>
						<div>
							<p className="text-muted-foreground text-sm">Total Providers</p>
							<p className="text-foreground text-2xl font-bold">
								{totalProviders}
							</p>
						</div>
					</div>

					<div className="flex items-center gap-4">
						<div className="flex items-center gap-2">
							<Zap className="text-primary h-4 w-4" />
							<span className="text-foreground text-sm font-medium">
								{electricityProviders}
							</span>
						</div>
						<div className="flex items-center gap-2">
							<Droplets className="text-primary h-4 w-4" />
							<span className="text-foreground text-sm font-medium">
								{waterProviders}
							</span>
						</div>
						<div className="flex items-center gap-2">
							<Flame className="text-primary h-4 w-4" />
							<span className="text-foreground text-sm font-medium">
								{gasProviders}
							</span>
						</div>
					</div>
				</div>

				{/* Add Provider Button */}
				<Button onClick={() => toggleDialog(DialogType.MAIN)}>
					<Plus className="mr-2 h-4 w-4" />
					Add Provider
				</Button>
			</div>

			{/* Providers Grid */}
			{providersList.length > 0 ? (
				<div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
					{providersList.map((provider) => {
						const Icon =
							categoryIcons[provider.category as keyof typeof categoryIcons] ||
							Building2;
						const colorClass =
							categoryColors[
								provider.category as keyof typeof categoryColors
							] || "bg-muted text-muted-foreground";

						return (
							<Card
								key={provider.id}
								className="group transition-all duration-200">
								<CardContent className="p-4">
									{/* Compact header */}
									<div className="mb-3 flex items-center justify-between">
										<div className="flex min-w-0 flex-1 items-center gap-2.5">
											<div
												className={`rounded-md p-1.5 ${colorClass.replace("text-", "bg-").replace("-800", "-100")} flex-shrink-0`}>
												<Icon className="h-4 w-4" />
											</div>
											<div className="min-w-0 flex-1">
												<h3 className="text-foreground truncate text-sm font-semibold">
													{provider.name}
												</h3>
												<Badge
													className={`${colorClass} mt-0.5 border-0 px-1.5 py-0.5 text-xs`}>
													{provider.category.charAt(0).toUpperCase() +
														provider.category.slice(1)}
												</Badge>
											</div>
										</div>
										<div className="flex gap-0.5 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
											<Button
												variant="ghost"
												size="sm"
												onClick={() => {
													setItemToEdit(provider);
													toggleDialog(DialogType.EDIT);
												}}
												className="text-muted-foreground hover:bg-accent hover:text-accent-foreground h-6 w-6 p-0">
												<Edit className="h-3 w-3" />
											</Button>
											<Button
												variant="ghost"
												size="sm"
												onClick={() => {
													setItemIdToDelete(provider.id || null);
													toggleDialog(DialogType.DELETE);
												}}
												className="text-muted-foreground hover:bg-destructive/20 hover:text-destructive h-6 w-6 p-0">
												<Trash2 className="h-3 w-3" />
											</Button>
										</div>
									</div>

									{/* Compact contact info */}
									{(provider.email || provider.website) && (
										<div className="space-y-1.5">
											{provider.email && (
												<div className="flex items-center gap-1.5">
													<Mail className="text-muted-foreground h-3 w-3 flex-shrink-0" />
													<a
														href={`mailto:${provider.email}`}
														className="text-primary truncate text-xs hover:underline">
														{provider.email}
													</a>
												</div>
											)}
											{provider.website && (
												<div className="flex items-center gap-1.5">
													<Globe className="text-muted-foreground h-3 w-3 flex-shrink-0" />
													<a
														href={provider.website}
														target="_blank"
														rel="noopener noreferrer"
														className="text-primary truncate text-xs hover:underline">
														{provider.website}
													</a>
												</div>
											)}
										</div>
									)}
								</CardContent>
							</Card>
						);
					})}
				</div>
			) : (
				<div className="py-12 text-center">
					<div className="bg-muted mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full">
						<Building2 className="text-muted-foreground h-8 w-8" />
					</div>
					<h3 className="text-foreground mb-2 text-lg font-semibold">
						No providers yet
					</h3>
					<p className="text-muted-foreground mb-6">
						Get started by adding your first utility provider
					</p>
					<Button onClick={() => toggleDialog(DialogType.MAIN)}>
						<Plus className="mr-2 h-4 w-4" />
						Add Your First Provider
					</Button>
				</div>
			)}

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
		</div>
	);
};
