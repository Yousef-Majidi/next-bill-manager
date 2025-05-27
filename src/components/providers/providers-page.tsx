"use client";

import { useAtom } from "jotai";
import { Droplets, Flame, Plus, Trash2, Zap } from "lucide-react";
import { toast } from "sonner";

import { DeleteDialog, PageHeader } from "@/components/common";
import { AddProviderDialog } from "@/components/providers";
import {
	Badge,
	Button,
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "@/components/ui";
import { useDialogState } from "@/hooks";
import { addUtilityProvider, deleteUtilityProvider } from "@/lib/data";
import { userAtom, utilityProvidersAtom } from "@/states";
import { UtilityProviderCategory, UtilityProviderFormData } from "@/types";

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
		addDialogOpen,
		deleteDialogOpen,
		itemIdToDelete,
		setItemIdToDelete,
		toggleAddDialog,
		toggleDeleteDialog,
	} = useDialogState();

	const [user] = useAtom(userAtom);
	const [providersList, setProvidersList] = useAtom(utilityProvidersAtom);

	const handleAddProvider = async (data: UtilityProviderFormData) => {
		if (!user) return;
		try {
			const result = await addUtilityProvider(user.id, {
				userId: user.id,
				name: data.name,
				category: data.category as UtilityProviderCategory,
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
					},
				]);
				toggleAddDialog();
			}
		} catch (error) {
			if (error instanceof Error) {
				toast.error(error.message);
				return;
			}
		}
	};

	const handleDeleteProvider = async (providerId: string) => {
		if (!user) return;
		try {
			const result = await deleteUtilityProvider(user.id, providerId);
			if (result.acknowledged) {
				toast.success(
					`${result.deletedCount} provider(s) deleted successfully`,
				);
			}
		} catch (error) {
			console.error(error);
			toast.error((error as Error).message || "Failed to delete provider");
		}
		toggleDeleteDialog();
		setProvidersList(providersList.filter((p) => p.id !== providerId));
	};

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<PageHeader
					title="Utility Providers"
					subtitle={<p>Manage your utility service providers</p>}
				/>

				<Button onClick={toggleAddDialog}>
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
							</div>
							<Button
								variant="ghost"
								size="sm"
								onClick={() => {
									setItemIdToDelete(provider.id || null);
									toggleDeleteDialog();
								}}
								className="text-destructive hover:text-destructive">
								<Trash2 className="h-4 w-4" />
							</Button>
						</CardHeader>
						<CardContent>
							<Badge
								className={
									categoryColors[
										provider.category as keyof typeof categoryColors
									]
								}>
								{provider.category.charAt(0).toUpperCase() +
									provider.category.slice(1)}
							</Badge>
						</CardContent>
					</Card>
				))}
			</div>

			<AddProviderDialog
				isOpen={addDialogOpen}
				onClose={toggleAddDialog}
				onSubmit={handleAddProvider}
			/>

			<DeleteDialog
				isOpen={deleteDialogOpen}
				title="Delete Provider"
				description="Are you sure you want to delete this provider? This action cannot be undone."
				onClose={toggleDeleteDialog}
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
						<Button onClick={toggleAddDialog}>
							<Plus className="mr-2 h-4 w-4" />
							Add Provider
						</Button>
					</CardContent>
				</Card>
			)}
		</div>
	);
};
