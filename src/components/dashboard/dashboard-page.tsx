"use client";

import { useEffect, useMemo, useState } from "react";

import { useAtom } from "jotai";
import { toast } from "sonner";

import { PageHeader } from "@/components/common";
import { ConsolidatedBillSection, StatsSummary } from "@/components/dashboard";
import { EmailPreviewDialog } from "@/components/dashboard/email-preview-dialog";
import { LastMonthSummary } from "@/components/dashboard/last-month-summary";
import { Badge } from "@/components/ui";
import { DialogType, useDialogState } from "@/hooks";
import { addConsolidatedBill } from "@/lib/data";
import { constructEmail, sendEmail } from "@/lib/gmail";
import { tenantsAtom, userAtom } from "@/states/store";
import { ConsolidatedBill, EmailContent, Tenant } from "@/types";

interface DashboardPageProps {
	readonly currentMonthBill: ConsolidatedBill | null;
	readonly lastMonthBills: ConsolidatedBill[];
}

export const DashboardPage = ({
	currentMonthBill,
	lastMonthBills,
}: DashboardPageProps) => {
	const currentDate = useMemo(() => new Date(), []);
	const currentDateString = currentDate.toLocaleDateString("en-US", {
		month: "long",
		day: "numeric",
		year: "numeric",
	});
	const [user] = useAtom(userAtom);
	const [tenantsList] = useAtom(tenantsAtom);
	const { mainDialogOpen, toggleDialog } = useDialogState();
	const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);
	const [emailContent, setEmailContent] = useState<EmailContent | null>(null);
	const [consolidatedBill, setConsolidatedBill] =
		useState<ConsolidatedBill | null>(null);

	useEffect(() => {
		if (tenantsList?.length > 0) {
			setSelectedTenant(tenantsList[0]);
			setConsolidatedBill(currentMonthBill);
		} else if (tenantsList) {
			toast.warning("No tenants available for this user.");
			setSelectedTenant(null);
		}
	}, [setSelectedTenant, selectedTenant, currentMonthBill, tenantsList]);

	const handleSendBill = () => {
		if (!selectedTenant) {
			toast.warning("Please select a tenant to send the bill.");
			return;
		}

		const tenant = tenantsList.find((t) => t.id === selectedTenant.id);
		if (!tenant) {
			toast.error("Selected tenant not found.");
			return;
		}

		if (!consolidatedBill) {
			toast.error("No bills available for the current month.");
			return;
		}
		setEmailContent(constructEmail(tenant, consolidatedBill));
		toggleDialog(DialogType.MAIN);
	};

	const confirmSendEmail = async () => {
		if (!emailContent) {
			toast.error("No email content to send.");
			return;
		}

		const tenant = tenantsList.find((t) => t.id === selectedTenant?.id);
		if (!tenant) {
			toast.error("Selected tenant not found.");
			return;
		}
		if (!consolidatedBill || consolidatedBill.totalAmount <= 0) {
			toast.error("No consolidated bill available to add.");
			return;
		}
		if (!user?.id) {
			toast.error("User ID is missing. Please log in again.");
			return;
		}

		try {
			const result = await sendEmail(emailContent, tenant);
			if (result.success) {
				const newBill = await addConsolidatedBill(user.id, consolidatedBill);
				if (newBill.acknowledged) {
					toast.success(`Email sent and bill added for ${tenant.name}!`);
				}
			} else {
				toast.error(`Failed to send email to ${tenant.name}.`);
			}
		} catch (error) {
			console.error("Error sending email:", error);
			toast.error("Failed to send email. Please try again.");
		}

		toggleDialog(DialogType.MAIN);
		setEmailContent(null);
	};

	return (
		<div className="flex flex-col gap-6">
			<PageHeader
				title={`Welcome ${user?.name || "User"}!`}
				subtitle={
					<Badge variant="outline" className="hidden sm:flex">
						{currentDateString}
					</Badge>
				}
			/>
			<StatsSummary currentMonthTotal={consolidatedBill?.totalAmount || 0} />
			{/* Current Month Bill */}

			<ConsolidatedBillSection
				consolidatedBill={consolidatedBill}
				tenantsList={tenantsList}
				selectedTenant={selectedTenant}
				setSelectedTenant={setSelectedTenant}
				handleSendBill={handleSendBill}
			/>

			{/* Last Month Bills Summary */}
			<LastMonthSummary
				currentDate={currentDate}
				lastMonthBills={lastMonthBills}
				tenantsList={tenantsList}
			/>
			{/* Email Confirmation Dialog */}
			{emailContent && selectedTenant && (
				<EmailPreviewDialog
					isOpen={mainDialogOpen}
					tenant={selectedTenant}
					emailContent={emailContent}
					onClose={() => toggleDialog(DialogType.MAIN)}
					onConfirm={confirmSendEmail}
				/>
			)}
		</div>
	);
};
