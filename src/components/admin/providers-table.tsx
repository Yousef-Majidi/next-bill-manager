"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { Edit, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { EditProviderDialog } from "@/components/admin/edit-provider-dialog";
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
import { deleteUtilityProvider, updateUtilityProvider } from "@/lib/data";
import { UtilityProvider } from "@/types";

interface ProvidersTableProps {
	readonly providers: UtilityProvider[];
	readonly userId: string;
	readonly onUpdate: (providers: UtilityProvider[]) => void;
}

export function ProvidersTable({
	providers,
	userId,
	onUpdate,
}: ProvidersTableProps) {
	const router = useRouter();
	const [searchTerm, setSearchTerm] = useState("");
	const [editingProvider, setEditingProvider] =
		useState<UtilityProvider | null>(null);
	const [deletingProvider, setDeletingProvider] =
		useState<UtilityProvider | null>(null);

	const filteredProviders = providers.filter((provider) => {
		if (!searchTerm) return true;
		const searchLower = searchTerm.toLowerCase();
		return (
			provider.name.toLowerCase().includes(searchLower) ||
			provider.category.toLowerCase().includes(searchLower) ||
			(provider.email && provider.email.toLowerCase().includes(searchLower)) ||
			(provider.website && provider.website.toLowerCase().includes(searchLower))
		);
	});

	const handleEdit = (provider: UtilityProvider) => {
		setEditingProvider(provider);
	};

	const handleDelete = (provider: UtilityProvider) => {
		setDeletingProvider(provider);
	};

	const handleDeleteConfirm = async () => {
		if (!deletingProvider) return;

		try {
			await deleteUtilityProvider(userId, deletingProvider.id || "");
			toast.success("Provider deleted successfully");
			onUpdate(providers.filter((p) => p.id !== deletingProvider.id));
			setDeletingProvider(null);
			router.refresh();
		} catch (error) {
			toast.error(
				error instanceof Error ? error.message : "Failed to delete provider",
			);
		}
	};

	const handleUpdate = async (
		providerId: string,
		updateData: Parameters<typeof updateUtilityProvider>[2],
	) => {
		try {
			await updateUtilityProvider(userId, providerId, updateData);
			toast.success("Provider updated successfully");
			setEditingProvider(null);
			router.refresh();
		} catch (error) {
			toast.error(
				error instanceof Error ? error.message : "Failed to update provider",
			);
		}
	};

	return (
		<>
			<div className="mb-4 flex items-center gap-4">
				<div className="relative flex-1">
					<Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
					<Input
						placeholder="Search providers..."
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
							<TableHead>Category</TableHead>
							<TableHead>Email</TableHead>
							<TableHead>Website</TableHead>
							<TableHead className="text-right">Actions</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{filteredProviders.length === 0 ? (
							<TableRow>
								<TableCell
									colSpan={5}
									className="text-muted-foreground text-center">
									No providers found
								</TableCell>
							</TableRow>
						) : (
							filteredProviders.map((provider) => (
								<TableRow key={provider.id}>
									<TableCell className="font-medium">{provider.name}</TableCell>
									<TableCell>
										<Badge variant="outline">{provider.category}</Badge>
									</TableCell>
									<TableCell>{provider.email || "-"}</TableCell>
									<TableCell>
										{provider.website ? (
											<a
												href={provider.website}
												target="_blank"
												rel="noopener noreferrer"
												className="text-primary hover:underline">
												{provider.website}
											</a>
										) : (
											"-"
										)}
									</TableCell>
									<TableCell className="text-right">
										<div className="flex justify-end gap-2">
											<Button
												variant="outline"
												size="sm"
												onClick={() => handleEdit(provider)}>
												<Edit className="h-4 w-4" />
											</Button>
											<Button
												variant="outline"
												size="sm"
												onClick={() => handleDelete(provider)}>
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

			{editingProvider && (
				<EditProviderDialog
					provider={editingProvider}
					onClose={() => setEditingProvider(null)}
					onSave={handleUpdate}
				/>
			)}

			{deletingProvider && (
				<DeleteDialog
					isOpen={true}
					title="Delete Provider"
					description={`Are you sure you want to delete provider "${deletingProvider.name}"?`}
					onClose={() => setDeletingProvider(null)}
					onConfirm={handleDeleteConfirm}
				/>
			)}
		</>
	);
}
