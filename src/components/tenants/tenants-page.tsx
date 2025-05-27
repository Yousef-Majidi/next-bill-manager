"use client";

import { useState } from "react";

import { useAtom } from "jotai";
import { Mail, Percent, Plus, Trash2, Users } from "lucide-react";

import { PageHeader } from "@/components/common";
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
} from "@/components/ui";
import { useDialogState } from "@/hooks";
import { tenantsAtom } from "@/states";
import { Tenant, UtilityProviderCategory as UtilityCategory } from "@/types";

export const TenantsPage = () => {
	const [tenants, setTenants] = useAtom(tenantsAtom);

	const { addDialogOpen, toggleAddDialog } = useDialogState();
	const [newTenant, setNewTenant] = useState<Tenant>({
		userId: "",
		name: "",
		email: "",
		shares: {
			Electricity: 0,
			Water: 0,
			Gas: 0,
		},
	});

	const handleAddTenant = () => {};

	const handleDeleteTenant = (id: string) => {
		setTenants(tenants.filter((t) => t.id !== id));
	};

	const updateShare = (category: string, value: number) => {
		setNewTenant({
			...newTenant,
			shares: { ...newTenant.shares, [category]: value },
		});
	};

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<PageHeader
					title="Tenants"
					subtitle={<p>Manage your tenants and their utility shares</p>}
				/>

				<Dialog open={addDialogOpen} onOpenChange={toggleAddDialog}>
					<DialogTrigger asChild>
						<Button>
							<Plus className="mr-2 h-4 w-4" />
							Add Tenant
						</Button>
					</DialogTrigger>
					<DialogContent className="max-w-md">
						<DialogHeader>
							<DialogTitle>Add New Tenant</DialogTitle>
							<DialogDescription>
								Add a new tenant and configure their utility share percentages
							</DialogDescription>
						</DialogHeader>

						<div className="space-y-4">
							<div>
								<Label htmlFor="name">Full Name</Label>
								<Input
									id="name"
									value={newTenant.name}
									onChange={(e) =>
										setNewTenant({ ...newTenant, name: e.target.value })
									}
									placeholder="e.g., John Doe"
								/>
							</div>

							<div>
								<Label htmlFor="email">Email Address</Label>
								<Input
									id="email"
									type="email"
									value={newTenant.email}
									onChange={(e) =>
										setNewTenant({ ...newTenant, email: e.target.value })
									}
									placeholder="e.g., john@example.com"
								/>
							</div>

							<div className="space-y-3">
								<Label>Utility Shares (%)</Label>

								<div className="space-y-2">
									<div className="flex items-center justify-between">
										<Label htmlFor="electricity" className="text-sm">
											Electricity
										</Label>
										<div className="flex items-center gap-2">
											<Input
												id="electricity"
												type="number"
												min="0"
												max="100"
												value={newTenant.shares.Electricity}
												onChange={(e) =>
													updateShare(
														UtilityCategory.Electricity,
														Number.parseInt(e.target.value) || 0,
													)
												}
												className="w-20"
											/>
											<span className="text-muted-foreground text-sm">%</span>
										</div>
									</div>

									<div className="flex items-center justify-between">
										<Label htmlFor="water" className="text-sm">
											Water
										</Label>
										<div className="flex items-center gap-2">
											<Input
												id="water"
												type="number"
												min="0"
												max="100"
												value={newTenant.shares.Water}
												onChange={(e) =>
													updateShare(
														UtilityCategory.Water,
														Number.parseInt(e.target.value) || 0,
													)
												}
												className="w-20"
											/>
											<span className="text-muted-foreground text-sm">%</span>
										</div>
									</div>

									<div className="flex items-center justify-between">
										<Label htmlFor="gas" className="text-sm">
											Gas
										</Label>
										<div className="flex items-center gap-2">
											<Input
												id="gas"
												type="number"
												min="0"
												max="100"
												value={newTenant.shares.Gas}
												onChange={(e) =>
													updateShare(
														UtilityCategory.Gas,
														Number.parseInt(e.target.value) || 0,
													)
												}
												className="w-20"
											/>
											<span className="text-muted-foreground text-sm">%</span>
										</div>
									</div>
								</div>
							</div>
						</div>

						<DialogFooter>
							<Button variant="outline" onClick={toggleAddDialog}>
								Cancel
							</Button>
							<Button onClick={handleAddTenant}>Add Tenant</Button>
						</DialogFooter>
					</DialogContent>
				</Dialog>
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
								onClick={() => handleDeleteTenant(tenant.id || "")}
								className="text-destructive hover:text-destructive">
								<Trash2 className="h-4 w-4" />
							</Button>
						</CardHeader>
						<CardContent>
							<div className="space-y-2">
								<div className="flex items-center justify-between text-sm">
									<span>Electricity</span>
									<Badge variant="outline">
										<Percent className="mr-1 h-3 w-3" />
										{tenant.shares.Electricity}%
									</Badge>
								</div>
								<div className="flex items-center justify-between text-sm">
									<span>Water</span>
									<Badge variant="outline">
										<Percent className="mr-1 h-3 w-3" />
										{tenant.shares.Water}%
									</Badge>
								</div>
								<div className="flex items-center justify-between text-sm">
									<span>Gas</span>
									<Badge variant="outline">
										<Percent className="mr-1 h-3 w-3" />
										{tenant.shares.Gas}%
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
						<Button onClick={toggleAddDialog}>
							<Plus className="mr-2 h-4 w-4" />
							Add Tenant
						</Button>
					</CardContent>
				</Card>
			)}
		</div>
	);
};
