"use server";

import type React from "react";

import { AppSidebar, DynamicBreadcrumb } from "@/components/app-sidebar";
import { DashboardWrapper } from "@/components/dashboard";
import {
	Separator,
	SidebarInset,
	SidebarProvider,
	SidebarTrigger,
} from "@/components/ui";
import { getTenants, getUser, getUtilityProviders } from "@/lib/data";

export default async function DashboardLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const loggedInUser = await getUser();
	const fetchedProviders = await getUtilityProviders(loggedInUser.id);
	const fetchedTenants = await getTenants(loggedInUser.id);
	return (
		<DashboardWrapper
			loggedInUser={loggedInUser}
			utilityProviders={fetchedProviders}
			tenants={fetchedTenants}>
			<SidebarProvider>
				<AppSidebar />
				<SidebarInset>
					<header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
						<div className="flex items-center gap-2 px-4">
							<SidebarTrigger className="-ml-1" />
							<Separator orientation="vertical" className="mr-2 h-4" />
							<DynamicBreadcrumb />
						</div>
					</header>
					<div className="flex flex-1 flex-col gap-4 p-4 pt-0">{children}</div>
				</SidebarInset>
			</SidebarProvider>
		</DashboardWrapper>
	);
}
