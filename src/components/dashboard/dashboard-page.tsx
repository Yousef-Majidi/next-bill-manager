"use client";

import { useEffect, useMemo, useState } from "react";

import { useAtom } from "jotai";
import { CheckCircle, Clock, FileText } from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/common";
import { ConsolidatedBillSection, StatsSummary } from "@/components/dashboard";
import { EmailPreviewDialog } from "@/components/dashboard/email-preview-dialog";
import {
	Badge,
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui";
import { DialogType, useDialogState } from "@/hooks";
import { addConsolidatedBill } from "@/lib/data";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { constructEmail, sendEmail } from "@/lib/gmail";
import { tenantsAtom, userAtom } from "@/states/store";
import {
	UtilityBill as Bill,
	ConsolidatedBill,
	EmailContent,
	Tenant,
	UtilityProviderCategory as UtilityCategory,
	UtilityProvider,
} from "@/types";

const lastMonthBills = [
	{
		id: "1",
		month: "November 2024",
		categories: {
			electricity: { amount: 140, provider: "City Electric" },
			water: { amount: 75, provider: "Metro Water" },
			gas: { amount: 110, provider: "Natural Gas Co" },
		},
		totalAmount: 325,
		tenant: "John Doe",
		tenantTotalShare: 162.5,
		tenantShares: {
			electricity: 70, // 50% of 140
			water: 37.5, // 50% of 75
			gas: 55, // 50% of 110
		},
		paid: true,
		dateSent: "2024-11-05",
	},
	{
		id: "2",
		month: "November 2024",
		categories: {
			electricity: { amount: 140, provider: "City Electric" },
			water: { amount: 75, provider: "Metro Water" },
			gas: { amount: 110, provider: "Natural Gas Co" },
		},
		totalAmount: 325,
		tenant: "Jane Smith",
		tenantTotalShare: 162.5,
		tenantShares: {
			electricity: 70, // 50% of 140
			water: 37.5, // 50% of 75
			gas: 55, // 50% of 110
		},
		paid: false,
		dateSent: "2024-11-05",
	},
];

interface DashboardPageProps {
	readonly currentMonthBills: Bill[];
}

export const DashboardPage = ({ currentMonthBills }: DashboardPageProps) => {
	const currentDate = useMemo(() => new Date(), []);
	const [user] = useAtom(userAtom);
	const [tenantsList] = useAtom(tenantsAtom);
	const { mainDialogOpen, toggleDialog } = useDialogState();
	const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);
	const [emailContent, setEmailContent] = useState<EmailContent | null>(null);
	const [consolidatedBill, setConsolidatedBill] =
		useState<ConsolidatedBill | null>(null);

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
		console.log("Consolidated Bill:", consolidatedBill);
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
		if (!consolidatedBill) {
			toast.error("No consolidated bill available to add.");
			return;
		}
		if (!user?.id) {
			toast.error("User ID is missing. Please log in again.");
			return;
		}

		try {
			// const result = await sendEmail(emailContent, tenant);
			// if (result.success) {
			// 	toast.success(`Email sent to ${tenant.name} successfully!`);
			// } else {
			// 	toast.error(`Failed to send email to ${tenant.name}. Please try again.`);
			// }

			const newBill = await addConsolidatedBill(user.id, consolidatedBill);
			if (newBill.acknowledged) {
				toast.success("Consolidated bill added successfully!");
			} else {
				toast.error("Failed to add consolidated bill. Please try again.");
			}
		} catch (error) {
			console.error("Error sending email:", error);
			toast.error("Failed to send email. Please try again.");
		}

		toggleDialog(DialogType.MAIN);
		setEmailContent(null);
		setSelectedTenant(null);
	};

	// Fetch user bills when component mounts
	useEffect(() => {
		if (!tenantsList || tenantsList.length === 0) {
			return;
		}
		setSelectedTenant(tenantsList[0] || null);
		const tenant = tenantsList[0];
		if (!user?.id) {
			toast.error("User not found. Please log in.");
			return;
		}
		const consolidatedBill: ConsolidatedBill = {
			id: undefined,
			userId: user.id,
			month: currentDate.getMonth() + 1,
			year: currentDate.getFullYear(),
			tenant: tenant,
			categories: currentMonthBills.reduce(
				(acc, bill) => {
					const categoryKey = bill.utilityProvider
						.category as keyof typeof UtilityCategory;
					return {
						...acc,
						[categoryKey]: acc[categoryKey]
							? {
									gmailMessageId: acc[categoryKey].gmailMessageId,
									amount: acc[categoryKey].amount + bill.amount,
									provider: bill.utilityProvider,
								}
							: {
									gmailMessageId: bill.gmailMessageId,
									amount: bill.amount,
									provider: bill.utilityProvider,
								},
					};
				},
				{} as {
					[K in keyof typeof UtilityCategory]: {
						gmailMessageId: string;
						amount: number;
						provider: UtilityProvider;
					};
				},
			),
			totalAmount: currentMonthBills.reduce(
				(sum, bill) => sum + bill.amount,
				0,
			),
			paid: false,
			dateSent: currentDate.toISOString(),
		};
		setConsolidatedBill(consolidatedBill);
	}, [currentDate, currentMonthBills, tenantsList, user?.id]);

	return (
		<div className="flex flex-col gap-6">
			<PageHeader
				title={`Welcome ${user?.name || "User"}!`}
				subtitle={
					<Badge variant="outline" className="hidden sm:flex">
						{currentDate.toLocaleDateString("en-US", {
							month: "long",
							day: "numeric",
							year: "numeric",
						})}
					</Badge>
				}
			/>
			<StatsSummary currentMonthTotal={consolidatedBill?.totalAmount || 0} />
			{/* Current Month Bill */}
			{consolidatedBill && (
				<ConsolidatedBillSection
					consolidatedBill={consolidatedBill}
					tenantsList={tenantsList}
					selectedTenant={selectedTenant}
					setSelectedTenant={setSelectedTenant}
					handleSendBill={handleSendBill}
				/>
			)}

			{/* Last Month Bills Summary */}
			<Card>
				<CardHeader>
					<CardTitle>Last Month Bills</CardTitle>
					<CardDescription>
						November 2024 - Bills sent to tenants
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="space-y-3">
						{lastMonthBills.map((bill, index) => (
							<div
								key={index}
								className="flex items-center justify-between rounded-lg border p-4">
								<div className="flex items-center gap-4">
									<div className="bg-primary/10 flex h-10 w-10 items-center justify-center rounded-full">
										<FileText className="h-5 w-5" />
									</div>
									<div>
										<p className="font-medium">{bill.tenant}</p>
										<p className="text-muted-foreground text-sm">
											Total Bill: ${bill.totalAmount} | Tenant Share: $
											{bill.tenantTotalShare}
										</p>
									</div>
								</div>
								<Badge variant={bill.paid ? "default" : "destructive"}>
									{bill.paid ? (
										<>
											<CheckCircle className="mr-1 h-3 w-3" />
											Paid
										</>
									) : (
										<>
											<Clock className="mr-1 h-3 w-3" />
											Unpaid
										</>
									)}
								</Badge>
							</div>
						))}
					</div>
				</CardContent>
			</Card>
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
