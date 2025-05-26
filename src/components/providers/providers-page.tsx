"use client";

import { useState } from "react";

import { useAtom } from "jotai";
import { Droplets, Flame, Plus, Trash2, Zap } from "lucide-react";
import { toast } from "sonner";

import { DeleteDialog } from "@/components/common";
import { AddDialog } from "@/components/providers";
import {
	Badge,
	Button,
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "@/components/ui";
import { addUtilityProvider, deleteUtilityProvider } from "@/lib/data";
import { userAtom } from "@/states";
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

interface ProvidersPageProps {
	readonly utilityProviders: UtilityProvider[];
}

export const ProvidersPage = ({ utilityProviders }: ProvidersPageProps) => {
	const [providers, setProviders] =
		useState<UtilityProvider[]>(utilityProviders);

	const [addDialogOpen, setAddDialogOpen] = useState(false);
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
	const [user] = useAtom(userAtom);

	const [providerIdToDelete, setProviderIdToDelete] = useState<string | null>(
		null,
	);

	const handleAddProvider = async (data: UtilityProviderFormData) => {
		if (!user) return;
		try {
			const result = await addUtilityProvider(user.id, {
				userId: user.id,
				name: data.name,
				category: data.category as UtilityProviderCategory,
			});
			if (result.acknowledged) {
				toast.success("Provider added successfully");
				setProviders((prev) => [
					...prev,
					{
						id: result.insertedId,
						userId: user.id,
						name: data.name,
						category: data.category as UtilityProviderCategory,
					},
				]);
				setAddDialogOpen(false);
			}
		} catch (error) {
			console.error(error);
			toast.error((error as Error).message || "Failed to add provider");
			return;
		}
	};

	const handleDeleteProvider = async (providerId: string) => {
		if (!user) return;
		try {
			const result = await deleteUtilityProvider(user.id, providerId);
			if (result) {
				toast.success("Provider deleted successfully");
			}
		} catch (error) {
			console.error(error);
			toast.error((error as Error).message || "Failed to delete provider");
		}
		setDeleteDialogOpen(false);
		setProviders(providers.filter((p) => p.id !== providerId));
	};

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-3xl font-bold">Utility Providers</h1>
					<p className="text-muted-foreground">
						Manage your utility service providers
					</p>
				</div>

				<Button onClick={() => setAddDialogOpen(true)}>
					<Plus className="mr-2 h-4 w-4" />
					Add Provider
				</Button>
			</div>

			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
				{providers.map((provider) => (
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
									setProviderIdToDelete(provider.id || null);
									setDeleteDialogOpen(true);
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

			<AddDialog
				isOpen={addDialogOpen}
				title="Add New Provider"
				description="Add a new utility provider to your account."
				onClose={() => setAddDialogOpen(false)}
				onSubmit={handleAddProvider}
			/>

			<DeleteDialog
				isOpen={deleteDialogOpen}
				title="Delete Provider"
				description="Are you sure you want to delete this provider? This action cannot be undone."
				onClose={() => setDeleteDialogOpen(false)}
				onConfirm={async () => {
					if (providerIdToDelete) {
						await handleDeleteProvider(providerIdToDelete);
					}
				}}
			/>
			{providers.length === 0 && (
				<Card>
					<CardContent className="flex flex-col items-center justify-center py-12">
						<Zap className="text-muted-foreground mb-4 h-12 w-12" />
						<h3 className="mb-2 text-lg font-medium">No providers added yet</h3>
						<p className="text-muted-foreground mb-4 text-center">
							Add your first utility provider to get started with bill
							management
						</p>
						<Button onClick={() => setAddDialogOpen(true)}>
							<Plus className="mr-2 h-4 w-4" />
							Add Provider
						</Button>
					</CardContent>
				</Card>
			)}
		</div>
	);
};
