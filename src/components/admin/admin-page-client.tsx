"use client";

import { useState } from "react";

import { FileText, Users, Zap } from "lucide-react";

import { BillsTable, ProvidersTable, TenantsTable } from "@/components/admin";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ConsolidatedBill, Tenant, UtilityProvider } from "@/types";

interface AdminPageClientProps {
	readonly bills: ConsolidatedBill[];
	readonly tenants: Tenant[];
	readonly providers: UtilityProvider[];
	readonly userId: string;
}

export function AdminPageClient({
	bills,
	tenants,
	providers,
	userId,
}: AdminPageClientProps) {
	// Use state for optimistic updates, but router.refresh() will update from server
	const [billsData, setBillsData] = useState(bills);
	const [tenantsData, setTenantsData] = useState(tenants);
	const [providersData, setProvidersData] = useState(providers);

	return (
		<div className="space-y-6">
			<div>
				<h1 className="text-3xl font-bold">Data Management</h1>
				<p className="text-muted-foreground">
					View and edit all your bills, tenants, and providers
				</p>
			</div>

			<Tabs defaultValue="bills" className="space-y-4">
				<TabsList>
					<TabsTrigger value="bills" className="gap-2">
						<FileText className="h-4 w-4" />
						Bills ({billsData.length})
					</TabsTrigger>
					<TabsTrigger value="tenants" className="gap-2">
						<Users className="h-4 w-4" />
						Tenants ({tenantsData.length})
					</TabsTrigger>
					<TabsTrigger value="providers" className="gap-2">
						<Zap className="h-4 w-4" />
						Providers ({providersData.length})
					</TabsTrigger>
				</TabsList>

				<TabsContent value="bills">
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<FileText className="h-5 w-5" />
								Bills
							</CardTitle>
							<CardDescription>
								Manage all your consolidated bills
							</CardDescription>
						</CardHeader>
						<CardContent>
							<BillsTable
								bills={billsData}
								tenants={tenantsData}
								userId={userId}
								onUpdate={(updatedBills) => setBillsData(updatedBills)}
							/>
						</CardContent>
					</Card>
				</TabsContent>

				<TabsContent value="tenants">
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<Users className="h-5 w-5" />
								Tenants
							</CardTitle>
							<CardDescription>Manage all your tenants</CardDescription>
						</CardHeader>
						<CardContent>
							<TenantsTable
								tenants={tenantsData}
								userId={userId}
								onUpdate={(updatedTenants) => setTenantsData(updatedTenants)}
							/>
						</CardContent>
					</Card>
				</TabsContent>

				<TabsContent value="providers">
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<Zap className="h-5 w-5" />
								Providers
							</CardTitle>
							<CardDescription>
								Manage all your utility providers
							</CardDescription>
						</CardHeader>
						<CardContent>
							<ProvidersTable
								providers={providersData}
								userId={userId}
								onUpdate={(updatedProviders) =>
									setProvidersData(updatedProviders)
								}
							/>
						</CardContent>
					</Card>
				</TabsContent>
			</Tabs>
		</div>
	);
}
