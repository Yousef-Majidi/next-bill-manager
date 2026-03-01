"use client";

import { usePathname } from "next/navigation";

import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

const breadcrumbMap: Record<string, string> = {
	dashboard: "Dashboard",
	providers: "Utility Providers",
	tenants: "Tenants",
	bills: "Bills History",
	settings: "Settings",
};

export function DynamicBreadcrumb() {
	const pathname = usePathname();
	const segments = (pathname ?? "").split("/").filter(Boolean);

	if (segments.length === 1) {
		return (
			<Breadcrumb>
				<BreadcrumbList>
					<BreadcrumbItem>
						<BreadcrumbPage>Dashboard</BreadcrumbPage>
					</BreadcrumbItem>
				</BreadcrumbList>
			</Breadcrumb>
		);
	}

	const breadcrumbs = [];
	for (let i = 1; i < segments.length; i++) {
		const segment = segments[i];
		if (!segment) continue;

		const label =
			breadcrumbMap[segment] ||
			segment.charAt(0).toUpperCase() + segment.slice(1);
		const href = "/" + segments.slice(0, i + 1).join("/");
		const isActive = i === segments.length - 1;

		breadcrumbs.push({ label, href, isActive });
	}

	return (
		<Breadcrumb>
			<BreadcrumbList>
				<BreadcrumbItem className="hidden md:block">
					<BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
				</BreadcrumbItem>
				{breadcrumbs.map((breadcrumb) => (
					<div key={breadcrumb.href} className="flex items-center">
						<BreadcrumbSeparator className="hidden md:block" />
						<BreadcrumbItem>
							{breadcrumb.isActive ? (
								<BreadcrumbPage>{breadcrumb.label}</BreadcrumbPage>
							) : (
								<BreadcrumbLink href={breadcrumb.href}>
									{breadcrumb.label}
								</BreadcrumbLink>
							)}
						</BreadcrumbItem>
					</div>
				))}
			</BreadcrumbList>
		</Breadcrumb>
	);
}
