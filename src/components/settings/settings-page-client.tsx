"use client";

import { useEffect, useMemo, useState } from "react";

import { useAtom } from "jotai";
import { Bell, Download, Mail, Shield, Trash2, User } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { isObjectType } from "@/lib/common/type-utils";
import { userAtom } from "@/states/store";

export function SettingsPageClient() {
	const [user] = useAtom(userAtom);
	const [mounted, setMounted] = useState(false);

	// Avoid hydration mismatch
	useEffect(() => {
		setMounted(true);
	}, []);

	// Get user initials for avatar
	const userInitials = useMemo(() => {
		if (
			!isObjectType(user) ||
			typeof user.name !== "string" ||
			!user.name.trim()
		)
			return "U";
		const names = user.name.trim().split(/\s+/);

		const firstInitial = names[0]?.[0] || "";
		const secondInitial = names.length > 1 ? names[1]?.[0] || "" : "";

		const initials = `${firstInitial}${secondInitial}`.toUpperCase();
		return initials || "U";
	}, [user]);

	// Get user name parts
	const userNameParts = useMemo(() => {
		if (!isObjectType(user) || !user.name)
			return { firstName: "", lastName: "" };
		const names = user.name.split(" ");
		return {
			firstName: names[0] || "",
			lastName: names.slice(1).join(" ") || "",
		};
	}, [user]);

	if (!mounted) {
		return null;
	}
	return (
		<div className="space-y-6">
			<div>
				<h1 className="text-3xl font-bold">Settings</h1>
				<p className="text-muted-foreground">
					Manage your account settings and preferences
				</p>
			</div>

			<div className="grid gap-6">
				{/* Profile Settings */}
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<User className="h-5 w-5" />
							Profile Settings
						</CardTitle>
						<CardDescription>
							Update your personal information and profile details
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-6">
						<div className="flex items-center gap-4">
							<Avatar className="h-20 w-20">
								<AvatarImage
									src="/placeholder.svg?height=80&width=80"
									alt="Profile"
								/>
								<AvatarFallback>{userInitials}</AvatarFallback>
							</Avatar>
							<div className="space-y-2">
								<Button variant="outline" size="sm">
									Change Photo
								</Button>
								<p className="text-muted-foreground text-sm">
									JPG, GIF or PNG. 1MB max.
								</p>
							</div>
						</div>

						<div className="grid gap-4 md:grid-cols-2">
							<div className="space-y-2">
								<Label htmlFor="firstName">First Name</Label>
								<Input
									id="firstName"
									defaultValue={userNameParts.firstName}
									disabled
								/>
							</div>
							<div className="space-y-2">
								<Label htmlFor="lastName">Last Name</Label>
								<Input
									id="lastName"
									defaultValue={userNameParts.lastName}
									disabled
								/>
							</div>
							<div className="space-y-2">
								<Label htmlFor="email">Email</Label>
								<Input
									id="email"
									type="email"
									defaultValue={isObjectType(user) ? user.email || "" : ""}
									disabled
								/>
							</div>
							<div className="space-y-2">
								<Label htmlFor="phone">Phone</Label>
								<Input id="phone" placeholder="Not set" disabled />
							</div>
						</div>

						<Button>Save Changes</Button>
					</CardContent>
				</Card>

				{/* Notification Settings */}
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<Bell className="h-5 w-5" />
							Notification Preferences
						</CardTitle>
						<CardDescription>
							Choose how you want to be notified about bills and payments
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="flex items-center justify-between">
							<div className="space-y-0.5">
								<Label>Email Notifications</Label>
								<p className="text-muted-foreground text-sm">
									Receive email updates about new bills and payments
								</p>
							</div>
							<Switch defaultChecked />
						</div>

						<Separator />

						<div className="flex items-center justify-between">
							<div className="space-y-0.5">
								<Label>Payment Reminders</Label>
								<p className="text-muted-foreground text-sm">
									Get reminded about upcoming payment due dates
								</p>
							</div>
							<Switch defaultChecked />
						</div>

						<Separator />

						<div className="flex items-center justify-between">
							<div className="space-y-0.5">
								<Label>Bill Processing Updates</Label>
								<p className="text-muted-foreground text-sm">
									Notifications when new bills are processed from your inbox
								</p>
							</div>
							<Switch />
						</div>

						<Separator />

						<div className="flex items-center justify-between">
							<div className="space-y-0.5">
								<Label>Monthly Summaries</Label>
								<p className="text-muted-foreground text-sm">
									Monthly reports of your billing activity
								</p>
							</div>
							<Switch defaultChecked />
						</div>
					</CardContent>
				</Card>

				{/* Email Settings */}
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<Mail className="h-5 w-5" />
							Email Integration
						</CardTitle>
						<CardDescription>
							Manage your Gmail integration for bill processing
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="flex items-center justify-between rounded-lg border p-4">
							<div className="flex items-center gap-3">
								<div className="bg-primary/20 flex h-10 w-10 items-center justify-center rounded-full">
									<Mail className="text-primary h-5 w-5" />
								</div>
								<div>
									<p className="text-foreground font-medium">Gmail Account</p>
									<p className="text-muted-foreground text-sm">
										{isObjectType(user)
											? user.email || "Not connected"
											: "Not connected"}
									</p>
								</div>
							</div>
							<div className="flex items-center gap-2">
								<Badge variant="default">Connected</Badge>
								<Button variant="outline" size="sm">
									Reconnect
								</Button>
							</div>
						</div>

						<div className="space-y-2">
							<Label>Bill Processing Folder</Label>
							<Input
								defaultValue="Bills"
								placeholder="Gmail label for bill processing"
							/>
							<p className="text-muted-foreground text-sm">
								Bills will be automatically processed from this Gmail label
							</p>
						</div>
					</CardContent>
				</Card>

				{/* Security Settings */}
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<Shield className="h-5 w-5" />
							Security & Privacy
						</CardTitle>
						<CardDescription>
							Manage your account security and data privacy settings
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="flex items-center justify-between">
							<div className="space-y-0.5">
								<Label>Two-Factor Authentication</Label>
								<p className="text-muted-foreground text-sm">
									Add an extra layer of security to your account
								</p>
							</div>
							<Button variant="outline" size="sm">
								Enable
							</Button>
						</div>

						<Separator />

						<div className="flex items-center justify-between">
							<div className="space-y-0.5">
								<Label>Data Export</Label>
								<p className="text-muted-foreground text-sm">
									Download all your data in a portable format
								</p>
							</div>
							<Button variant="outline" size="sm">
								<Download className="mr-1 h-4 w-4" />
								Export Data
							</Button>
						</div>

						<Separator />

						<div className="flex items-center justify-between">
							<div className="space-y-0.5">
								<Label className="text-destructive">Delete Account</Label>
								<p className="text-muted-foreground text-sm">
									Permanently delete your account and all data
								</p>
							</div>
							<Button variant="destructive" size="sm">
								<Trash2 className="mr-1 h-4 w-4" />
								Delete Account
							</Button>
						</div>
					</CardContent>
				</Card>

				{/* Appearance Settings */}
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<Shield className="h-5 w-5" />
							Display Preferences
						</CardTitle>
						<CardDescription>
							Customize the look and feel of your dashboard
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="flex items-center justify-between">
							<div className="space-y-0.5">
								<Label>Compact Mode</Label>
								<p className="text-muted-foreground text-sm">
									Use a more compact layout to fit more content
								</p>
							</div>
							<Switch />
						</div>
						<p className="text-muted-foreground text-sm">
							Theme settings can be changed from the sidebar theme toggle.
						</p>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
