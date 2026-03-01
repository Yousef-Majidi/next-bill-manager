"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type * as React from "react";
import { useEffect, useMemo, useState } from "react";

import { useAtom } from "jotai";
import {
	Database,
	DollarSign,
	FileText,
	Home,
	LogOut,
	Mail,
	Moon,
	Settings,
	Sun,
	Users,
	Zap,
} from "lucide-react";
import { signOut } from "next-auth/react";
import { useTheme } from "next-themes";

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
import { isObjectType } from "@/lib/common/type-utils";
import { billsHistoryAtom, userAtom } from "@/states/store";

// Navigation data with color coding
const navigationItems = [
	{
		title: "Dashboard",
		url: "/dashboard",
		icon: Home,
		description: "Overview and current bills",
		color: "text-[oklch(0.70_0.18_200)]",
	},
	{
		title: "Utility Providers",
		url: "/dashboard/providers",
		icon: Zap,
		description: "Manage utility companies",
		color: "text-[oklch(0.70_0.18_60)]",
	},
	{
		title: "Tenants",
		url: "/dashboard/tenants",
		icon: Users,
		description: "Manage tenant information",
		color: "text-[oklch(0.70_0.18_280)]",
	},
	{
		title: "Bills History",
		url: "/dashboard/bills",
		icon: FileText,
		description: "View past bills and payments",
		color: "text-[oklch(0.70_0.18_190)]",
	},
	{
		title: "Data Management",
		url: "/dashboard/admin",
		icon: Database,
		description: "View and edit all data",
		color: "text-[oklch(0.70_0.18_140)]",
	},
];

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
	const pathname = usePathname();
	const { theme, setTheme, resolvedTheme } = useTheme();
	const [user] = useAtom(userAtom);
	const [billsHistory] = useAtom(billsHistoryAtom);
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		setMounted(true);
	}, []);

	// Calculate Quick Stats
	const quickStats = useMemo(() => {
		const now = new Date();
		const currentMonth = now.getMonth() + 1;
		const currentYear = now.getFullYear();

		// Current month total
		const currentMonthBills = billsHistory.filter(
			(bill) => bill.month === currentMonth && bill.year === currentYear,
		);
		const currentMonthTotal = currentMonthBills.reduce(
			(sum, bill) => sum + (bill.totalAmount || 0),
			0,
		);

		// Pending bills (unpaid bills)
		const pendingBillsCount = billsHistory.filter((bill) => !bill.paid).length;

		return [
			{
				label: "Current Month",
				value: `$${currentMonthTotal.toFixed(0)}`,
				icon: DollarSign,
				color: "text-[oklch(0.70_0.18_200)]",
			},
			{
				label: "Pending Bills",
				value: pendingBillsCount.toString(),
				icon: Mail,
				color: "text-[oklch(0.70_0.18_25)]",
			},
		];
	}, [billsHistory]);

	// Get user initials for avatar
	const userInitials = useMemo(() => {
		if (!isObjectType(user) || !user.name) return "U";
		const names = user.name.split(" ");
		if (names.length >= 2) {
			return `${names[0][0]}${names[1][0]}`.toUpperCase();
		}
		return user.name[0].toUpperCase();
	}, [user]);

	const handleLogOut = () => {
		signOut();
	};

	const toggleTheme = () => {
		// Only toggle between dark and light
		if (theme === "light" || resolvedTheme === "light") {
			setTheme("dark");
		} else {
			setTheme("light");
		}
	};

	// Use resolvedTheme for icon display (accounts for system theme on first load)
	const currentTheme = mounted ? resolvedTheme || theme || "dark" : "dark";
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
											<item.icon className={`size-4 ${item.color}`} />
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
									<div className="bg-primary size-4 rounded-full" />
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
									<div className="size-4 rounded-full bg-[oklch(0.70_0.18_60)]" />
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
								<AvatarFallback>{userInitials}</AvatarFallback>
							</Avatar>
							<div className="grid flex-1 text-left text-sm leading-tight">
								<span className="truncate font-semibold">
									{isObjectType(user) ? user.name || "User" : "User"}
								</span>
								<span className="text-muted-foreground truncate text-xs">
									{isObjectType(user) ? user.email || "" : ""}
								</span>
							</div>
						</SidebarMenuButton>
					</SidebarMenuItem>
					<SidebarMenuItem>
						<SidebarMenuButton
							onClick={toggleTheme}
							tooltip={`Switch to ${currentTheme === "light" ? "dark" : "light"} theme`}>
							{currentTheme === "light" ? (
								<Sun className="size-4" />
							) : (
								<Moon className="size-4" />
							)}
							<span>Theme</span>
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
