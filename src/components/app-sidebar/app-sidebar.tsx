"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type * as React from "react";

import {
	DollarSign,
	FileText,
	Home,
	LogOut,
	Mail,
	Settings,
	Users,
	Zap,
} from "lucide-react";
import { signOut } from "next-auth/react";

import {
	Avatar,
	AvatarFallback,
	AvatarImage,
	Badge,
	Button,
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarGroup,
	SidebarGroupContent,
	SidebarGroupLabel,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	SidebarRail,
	SidebarSeparator,
} from "@/components/ui";

// Navigation data
const navigationItems = [
	{
		title: "Dashboard",
		url: "/dashboard",
		icon: Home,
		description: "Overview and current bills",
	},
	{
		title: "Utility Providers",
		url: "/dashboard/providers",
		icon: Zap,
		description: "Manage utility companies",
	},
	{
		title: "Tenants",
		url: "/dashboard/tenants",
		icon: Users,
		description: "Manage tenant information",
	},
	{
		title: "Bills History",
		url: "/dashboard/bills",
		icon: FileText,
		description: "View past bills and payments",
	},
];

const quickStats = [
	{
		label: "Current Month",
		value: "$350",
		icon: DollarSign,
		color: "text-blue-600",
	},
	{
		label: "Pending Bills",
		value: "2",
		icon: Mail,
		color: "text-orange-600",
	},
];

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
	const pathname = usePathname();

	const handleLogOut = () => {
		signOut();
	};

	return (
		<Sidebar collapsible="icon" {...props}>
			<SidebarHeader>
				<SidebarMenu>
					<SidebarMenuItem>
						<SidebarMenuButton size="lg" asChild>
							<Link href="/dashboard">
								<div className="bg-primary text-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
									<DollarSign className="size-4" />
								</div>
								<div className="grid flex-1 text-left text-sm leading-tight">
									<span className="truncate font-semibold">
										Next Bill Manager
									</span>
									<span className="truncate text-xs">Utility Management</span>
								</div>
							</Link>
						</SidebarMenuButton>
					</SidebarMenuItem>
				</SidebarMenu>
			</SidebarHeader>

			<SidebarContent>
				{/* Navigation Section */}
				<SidebarGroup>
					<SidebarGroupLabel>Navigation</SidebarGroupLabel>
					<SidebarGroupContent>
						<SidebarMenu>
							{navigationItems.map((item) => (
								<SidebarMenuItem key={item.title}>
									<SidebarMenuButton
										asChild
										isActive={pathname === item.url}
										tooltip={item.description}>
										<Link href={item.url}>
											<item.icon className="size-4" />
											<span>{item.title}</span>
										</Link>
									</SidebarMenuButton>
								</SidebarMenuItem>
							))}
						</SidebarMenu>
					</SidebarGroupContent>
				</SidebarGroup>

				<SidebarSeparator />

				{/* Quick Stats Section */}
				<SidebarGroup>
					<SidebarGroupLabel>Quick Stats</SidebarGroupLabel>
					<SidebarGroupContent>
						<SidebarMenu>
							{quickStats.map((stat) => (
								<SidebarMenuItem key={stat.label}>
									<SidebarMenuButton>
										<stat.icon className={`size-4 ${stat.color}`} />
										<div className="flex flex-1 items-center justify-between">
											<span className="text-sm">{stat.label}</span>
											<Badge variant="secondary" className="ml-auto">
												{stat.value}
											</Badge>
										</div>
									</SidebarMenuButton>
								</SidebarMenuItem>
							))}
						</SidebarMenu>
					</SidebarGroupContent>
				</SidebarGroup>

				<SidebarSeparator />

				{/* Recent Activity Section */}
				<SidebarGroup>
					<SidebarGroupLabel>Recent Activity</SidebarGroupLabel>
					<SidebarGroupContent>
						<SidebarMenu>
							<SidebarMenuItem>
								<SidebarMenuButton>
									<div className="size-4 rounded-full bg-green-500" />
									<div className="flex flex-col">
										<span className="text-xs">John Doe paid</span>
										<span className="text-muted-foreground text-xs">
											2 days ago
										</span>
									</div>
								</SidebarMenuButton>
							</SidebarMenuItem>
							<SidebarMenuItem>
								<SidebarMenuButton>
									<div className="size-4 rounded-full bg-blue-500" />
									<div className="flex flex-col">
										<span className="text-xs">Bill sent to Jane</span>
										<span className="text-muted-foreground text-xs">
											5 days ago
										</span>
									</div>
								</SidebarMenuButton>
							</SidebarMenuItem>
							<SidebarMenuItem>
								<SidebarMenuButton>
									<div className="size-4 rounded-full bg-orange-500" />
									<div className="flex flex-col">
										<span className="text-xs">New provider added</span>
										<span className="text-muted-foreground text-xs">
											1 week ago
										</span>
									</div>
								</SidebarMenuButton>
							</SidebarMenuItem>
						</SidebarMenu>
					</SidebarGroupContent>
				</SidebarGroup>
			</SidebarContent>

			<SidebarFooter>
				<SidebarMenu>
					<SidebarMenuItem>
						<SidebarMenuButton>
							<Avatar className="size-6">
								<AvatarImage
									src="/placeholder.svg?height=24&width=24"
									alt="User"
								/>
								<AvatarFallback>JD</AvatarFallback>
							</Avatar>
							<div className="grid flex-1 text-left text-sm leading-tight">
								<span className="truncate font-semibold">John Doe</span>
								<span className="text-muted-foreground truncate text-xs">
									john@example.com
								</span>
							</div>
						</SidebarMenuButton>
					</SidebarMenuItem>
					<SidebarMenuItem>
						<SidebarMenuButton asChild>
							<Link href="/dashboard/settings">
								<Settings className="size-4" />
								<span>Settings</span>
							</Link>
						</SidebarMenuButton>
					</SidebarMenuItem>
					<SidebarMenuItem>
						<SidebarMenuButton asChild>
							<Button
								variant="ghost"
								className="flex items-center"
								onClick={() => handleLogOut()}>
								<span>Log Out</span>
								<LogOut className="size-4" />
							</Button>
						</SidebarMenuButton>
					</SidebarMenuItem>
				</SidebarMenu>
			</SidebarFooter>

			<SidebarRail />
		</Sidebar>
	);
}
