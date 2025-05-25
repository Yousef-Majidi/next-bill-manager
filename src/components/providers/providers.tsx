"use client";

import { useState } from "react";

import { Droplets, Flame, Plus, Trash2, Zap } from "lucide-react";

import {
	Badge,
	Button,
	Card,
	CardContent,
	CardHeader,
	CardTitle,
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
	Input,
	Label,
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui";

const categoryIcons = {
	electricity: Zap,
	water: Droplets,
	gas: Flame,
};

const categoryColors = {
	electricity: "bg-yellow-100 text-yellow-800",
	water: "bg-blue-100 text-blue-800",
	gas: "bg-orange-100 text-orange-800",
};

export default function ProvidersPage() {
	const [providers, setProviders] = useState([
		{ id: "1", name: "City Electric", category: "electricity" },
		{ id: "2", name: "Metro Water", category: "water" },
		{ id: "3", name: "Natural Gas Co", category: "gas" },
	]);

	const [dialogOpen, setDialogOpen] = useState(false);
	const [newProvider, setNewProvider] = useState({ name: "", category: "" });

	const handleAddProvider = () => {
		if (newProvider.name && newProvider.category) {
			setProviders([
				...providers,
				{
					id: Date.now().toString(),
					name: newProvider.name,
					category: newProvider.category,
				},
			]);
			setNewProvider({ name: "", category: "" });
			setDialogOpen(false);
		}
	};

	const handleDeleteProvider = (id: string) => {
		setProviders(providers.filter((p) => p.id !== id));
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

				<Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
					<DialogTrigger asChild>
						<Button>
							<Plus className="mr-2 h-4 w-4" />
							Add Provider
						</Button>
					</DialogTrigger>
					<DialogContent>
						<DialogHeader>
							<DialogTitle>Add New Provider</DialogTitle>
							<DialogDescription>
								Add a new utility provider to your account
							</DialogDescription>
						</DialogHeader>

						<div className="space-y-4">
							<div>
								<Label htmlFor="name">Provider Name</Label>
								<Input
									id="name"
									value={newProvider.name}
									onChange={(e) =>
										setNewProvider({ ...newProvider, name: e.target.value })
									}
									placeholder="e.g., City Electric Company"
								/>
							</div>

							<div>
								<Label htmlFor="category">Category</Label>
								<Select
									value={newProvider.category}
									onValueChange={(value) =>
										setNewProvider({ ...newProvider, category: value })
									}>
									<SelectTrigger>
										<SelectValue placeholder="Select category" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="electricity">Electricity</SelectItem>
										<SelectItem value="water">Water</SelectItem>
										<SelectItem value="gas">Gas</SelectItem>
									</SelectContent>
								</Select>
							</div>
						</div>

						<DialogFooter>
							<Button variant="outline" onClick={() => setDialogOpen(false)}>
								Cancel
							</Button>
							<Button onClick={handleAddProvider}>Add Provider</Button>
						</DialogFooter>
					</DialogContent>
				</Dialog>
			</div>

			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
				{providers.map((provider) => {
					const Icon =
						categoryIcons[provider.category as keyof typeof categoryIcons];
					return (
						<Card key={provider.id}>
							<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
								<div className="flex items-center gap-2">
									<Icon className="h-5 w-5" />
									<CardTitle className="text-lg">{provider.name}</CardTitle>
								</div>
								<Button
									variant="ghost"
									size="sm"
									onClick={() => handleDeleteProvider(provider.id)}
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
					);
				})}
			</div>

			{providers.length === 0 && (
				<Card>
					<CardContent className="flex flex-col items-center justify-center py-12">
						<Zap className="text-muted-foreground mb-4 h-12 w-12" />
						<h3 className="mb-2 text-lg font-medium">No providers added yet</h3>
						<p className="text-muted-foreground mb-4 text-center">
							Add your first utility provider to get started with bill
							management
						</p>
						<Button onClick={() => setDialogOpen(true)}>
							<Plus className="mr-2 h-4 w-4" />
							Add Provider
						</Button>
					</CardContent>
				</Card>
			)}
		</div>
	);
}
