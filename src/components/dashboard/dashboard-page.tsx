"use client";

import { useEffect, useState } from "react";

import { useAtom } from "jotai";
import { CheckCircle, Clock, FileText, Mail } from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/common";
import { StatsSummary } from "@/components/dashboard";
import { BillBreakdown } from "@/components/dashboard/bill-breakdown";
import { EmailPreviewDialog } from "@/components/dashboard/email-preview-dialog";
import {
	Badge,
	Button,
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
	Separator,
} from "@/components/ui";
import { useDialogState } from "@/hooks";
import { constructEmail, sendEmail } from "@/lib/gmail-utils";
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
	const currentDate = new Date();
	const [user] = useAtom(userAtom);
	const [tenantsList] = useAtom(tenantsAtom);
	const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null); // TODO: Refactor to use tenant object instead of ID
	const { addDialogOpen, toggleAddDialog } = useDialogState();
	const [emailContent, setEmailContent] = useState<EmailContent | null>(null);
	const [currentMonthBill, setCurrentMonthBill] = useState<Bill[]>([]);

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

		// Calculate categories and total amount for the consolidated bill
		const categories = currentMonthBills.reduce(
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
		);

		const totalAmount = Object.values(categories).reduce(
			(sum, category) => sum + category.amount,
			0,
		);

		// Create a new ConsolidatedBill instance
		const consolidatedBill = new ConsolidatedBill(
			undefined,
			currentDate.getMonth() + 1,
			currentDate.getFullYear(),
			tenant,
			categories,
			totalAmount,
			false,
			currentDate.toISOString(),
		);
		setEmailContent(constructEmail(tenant, consolidatedBill));
		toggleAddDialog();
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

		const result = await sendEmail(emailContent, tenant);
		if (result.success) {
			toast.success(`Email sent to ${tenant.name} successfully!`);
		} else {
			toast.error(`Failed to send email to ${tenant.name}. Please try again.`);
		}

		toggleAddDialog();
		setEmailContent(null);
		setSelectedTenant(null);
	};

	// const lastMonthTotal = lastMonthBills.reduce(
	// 	(sum, bill) => sum + bill.tenantTotalShare,
	// 	0,
	// );
	// const paidAmount = lastMonthBills
	// 	.filter((bill) => bill.paid)
	// 	.reduce((sum, bill) => sum + bill.tenantTotalShare, 0);
	// const unpaidAmount = lastMonthTotal - paidAmount;

	// Fetch user bills when component mounts
	useEffect(() => {
		setCurrentMonthBill(currentMonthBills);
	}, [currentMonthBills]);

	const currentMonthTotal = currentMonthBill.reduce(
		(sum, bill) => sum + bill.amount,
		0,
	);

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
			<StatsSummary currentMonthTotal={currentMonthTotal} />
			{/* Current Month Bill */}
			<Card>
				<CardHeader>
					<CardTitle>Current Month Bill</CardTitle>
					<CardDescription>
						Breakdown of utility bills for the current month
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="space-y-6">
						{/* Bill Breakdown */}
						<BillBreakdown currentMonthBills={currentMonthBill} />

						<Separator />

						{/* Total and Send Section */}
						<div className="flex items-center justify-between">
							<div>
								<h3 className="text-lg font-semibold">Total Bill Amount</h3>
								<p className="text-primary text-3xl font-bold">
									$
									{currentMonthBills
										.reduce((sum, bill) => sum + bill.amount, 0)
										.toFixed(2)}
								</p>
							</div>

							<div className="flex items-center gap-4">
								<Select
									value={selectedTenant?.id}
									onValueChange={(tenantId) => {
										const tenant = tenantsList.find((t) => t.id === tenantId);
										setSelectedTenant(tenant ?? null);
									}}>
									<SelectTrigger className="w-48">
										<SelectValue placeholder="Select tenant to bill" />
									</SelectTrigger>
									<SelectContent>
										{tenantsList.map((tenant) => (
											<SelectItem
												key={tenant.id}
												value={tenant.id || tenant.name}>
												{tenant.name}
											</SelectItem>
										))}
									</SelectContent>
								</Select>

								<Button
									onClick={() => {
										handleSendBill();
										// setEmailDialogOpen(true);
									}}
									disabled={!selectedTenant}>
									<Mail className="mr-2 h-4 w-4" />
									Send Bill
								</Button>
							</div>
						</div>
					</div>
				</CardContent>
			</Card>
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
					isOpen={addDialogOpen}
					tenant={selectedTenant}
					emailContent={emailContent}
					onClose={toggleAddDialog}
					onConfirm={confirmSendEmail}
				/>
			)}
		</div>
	);
};
