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
import { getTenantShares } from "@/lib/common/utils";
import { addConsolidatedBill, findById } from "@/lib/data";
import { constructEmail, processTenantPayments, sendEmail } from "@/lib/gmail";
import { billsHistoryAtom, tenantsAtom, userAtom } from "@/states/store";
import { ConsolidatedBill, EmailContent, Tenant } from "@/types";

interface DashboardPageProps {
	readonly currentMonthBill: ConsolidatedBill | null;
}

export const DashboardPage = ({ currentMonthBill }: DashboardPageProps) => {
	const now = useMemo(() => new Date(), []);
	const currentDateString = now.toLocaleDateString("en-US", {
		month: "long",
		day: "numeric",
		year: "numeric",
	});
	const [user] = useAtom(userAtom);
	const [tenantsList] = useAtom(tenantsAtom);
	const [billsHistory] = useAtom(billsHistoryAtom);
	const { mainDialogOpen, toggleDialog } = useDialogState();
	const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);
	const [emailContent, setEmailContent] = useState<EmailContent | null>(null);
	// const [isLastMonthPaid, setIsLastMonthPaid] = useState<boolean>(false);
	const [consolidatedBill, setConsolidatedBill] =
		useState<ConsolidatedBill | null>(null);

	const handleWaterAmountChange = (amount: number) => {
		if (consolidatedBill) {
			const updatedBill = {
				...consolidatedBill,
				categories: {
					...consolidatedBill.categories,
					Water: {
						...consolidatedBill.categories.Water,
						amount: amount,
					},
				},
				totalAmount: Object.values({
					...consolidatedBill.categories,
					Water: {
						...consolidatedBill.categories.Water,
						amount: amount,
					},
				}).reduce((sum, category) => sum + category.amount, 0),
			};
			setConsolidatedBill(updatedBill);

			if (amount === 0) {
				toast.success("Water bill amount reset to $0.00");
			} else {
				toast.success(`Water bill amount updated to $${amount.toFixed(2)}`);
			}
		}
	};

	// TODO: Tenants now track their own balances, so this is not needed
	const outstandingBalance = useMemo(() => {
		return billsHistory.reduce((sum, bill) => {
			if (!bill.paid && bill.tenantId) {
				const tenant = findById(tenantsList, bill.tenantId);
				if (tenant) {
					const { tenantTotal } = getTenantShares(bill, tenant);
					return sum + tenantTotal;
				}
			}
			return sum;
		}, 0);
	}, [billsHistory, tenantsList]);

	const lastMonthConsolidatedBill = useMemo(() => {
		const prevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
		const lastMonthYear = prevMonth.getFullYear();
		const lastMonthMonth = prevMonth.getMonth();

		return billsHistory.filter((bill) => {
			const billDate = new Date(bill.year, bill.month - 1, 1);
			return (
				billDate.getFullYear() === lastMonthYear &&
				billDate.getMonth() === lastMonthMonth
			);
		});
	}, [billsHistory, now]);

	const lastMonthTenant = useMemo(
		() => findById(tenantsList, lastMonthConsolidatedBill[0]?.tenantId ?? ""),
		[lastMonthConsolidatedBill, tenantsList],
	);

	const lastMonthTenantTotal = useMemo(() => {
		return lastMonthConsolidatedBill[0] && lastMonthTenant
			? getTenantShares(lastMonthConsolidatedBill[0], lastMonthTenant)
					.tenantTotal
			: 0;
	}, [lastMonthConsolidatedBill, lastMonthTenant]);

	const paidAmount = useMemo(() => {
		return lastMonthConsolidatedBill.reduce((sum, bill) => {
			if (bill.paid && bill.tenantId) {
				const tenant = findById(tenantsList, bill.tenantId);
				if (tenant) {
					const { tenantTotal } = getTenantShares(bill, tenant);
					return sum + tenantTotal;
				}
			}
			return sum;
		}, 0);
	}, [lastMonthConsolidatedBill, tenantsList]);

	useEffect(() => {
		if (tenantsList?.length > 0) {
			setSelectedTenant(tenantsList[0]);
			setConsolidatedBill(currentMonthBill);
		} else if (tenantsList) {
			toast.warning("No tenants available for this user.");
			setSelectedTenant(null);
		}
	}, [setSelectedTenant, currentMonthBill, tenantsList]);

	useEffect(() => {
		if (!user) return;

		const checkPayments = async () => {
			const tenantsWithOutstanding = tenantsList.filter((tenant) => {
				return billsHistory.some(
					(bill) => bill.tenantId === tenant.id && !bill.paid,
				);
			});

			if (tenantsWithOutstanding.length === 0) {
				return;
			}

			// Set date range for payment detection (last 30 days)
			const endDate = new Date();
			const startDate = new Date();
			startDate.setDate(startDate.getDate() - 30);

			const dateRange = {
				start: startDate.toISOString().split("T")[0],
				end: endDate.toISOString().split("T")[0],
			};

			for (const tenant of tenantsWithOutstanding) {
				try {
					const result = await processTenantPayments(
						tenant,
						billsHistory,
						dateRange,
					);

					if (result.processed) {
						toast.success(result.message);
					} else {
						toast.info(result.message);
					}
				} catch (error) {
					console.error(`Error processing payments for ${tenant.name}:`, error);
					toast.error(`Failed to process payments for ${tenant.name}.`);
				}
			}
		};

		checkPayments();
	}, [billsHistory, tenantsList, user]);

	const handleSendBill = () => {
		if (!selectedTenant) {
			toast.warning("Please select a tenant to send the bill.");
			return;
		}

		if (!consolidatedBill) {
			toast.error("No bills available for the current month.");
			return;
		}
		const emailContent = constructEmail(selectedTenant, consolidatedBill);
		setEmailContent(emailContent);
		toggleDialog(DialogType.MAIN);
	};

	const confirmSendEmail = async () => {
		if (!emailContent) {
			toast.error("No email content to send.");
			return;
		}
		if (!selectedTenant) {
			toast.error("No tenant selected to send the bill.");
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
			const result = await sendEmail(emailContent, selectedTenant);
			if (result.success) {
				// Update the consolidated bill with tenant ID and sent date before saving
				const billToSave = {
					...consolidatedBill,
					tenantId: selectedTenant.id,
					dateSent: new Date().toISOString(),
				};

				const newBill = await addConsolidatedBill(user.id, billToSave);
				if (newBill.acknowledged) {
					toast.success(
						`Email sent and bill added for ${selectedTenant.name}!`,
					);
				}
			} else {
				toast.error(`Failed to send email to ${selectedTenant.name}.`);
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
			{(() => {
				if (consolidatedBill?.month !== now.getMonth() + 1) {
					return (
						<div className="mb-2 rounded bg-red-100 px-4 py-2 font-mono font-bold text-red-700">
							DEBUG MODE: Displaying bills for{" "}
							{consolidatedBill
								? new Date(
										consolidatedBill.year,
										consolidatedBill.month - 1,
									).toLocaleString("en-US", {
										month: "long",
										year: "numeric",
									})
								: ""}
							.
						</div>
					);
				}
				return null;
			})()}
			<PageHeader
				title={`Welcome ${user?.name || "User"}!`}
				subtitle={
					<Badge variant="outline" className="hidden sm:flex">
						{currentDateString}
					</Badge>
				}
			/>

			<StatsSummary
				currentMonthTotal={consolidatedBill?.totalAmount || 0}
				lastMonthTotal={lastMonthTenantTotal}
				outstandingBalance={outstandingBalance}
				paidAmount={paidAmount}
			/>

			<ConsolidatedBillSection
				consolidatedBill={consolidatedBill}
				tenantsList={tenantsList}
				selectedTenant={selectedTenant}
				setSelectedTenant={setSelectedTenant}
				handleSendBill={handleSendBill}
				onWaterAmountChange={handleWaterAmountChange}
			/>

			<LastMonthSummary
				currentDate={now}
				lastMonthBills={lastMonthConsolidatedBill}
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
