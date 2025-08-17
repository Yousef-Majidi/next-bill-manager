import type { Metadata } from "next";

import { SettingsPageClient } from "@/components/settings/settings-page-client";

export const metadata: Metadata = {
	title: "Settings | Next Bill Manager",
	description: "Manage your account settings",
};

export default async function SettingsPage() {
	return <SettingsPageClient />;
}
