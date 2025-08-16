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
import { safeExecuteAsync } from "@/lib/common/error-handling";
import { isObjectType, safeGetProperty } from "@/lib/common/type-utils";
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
	const [consolidatedBill, setConsolidatedBill] =
		useState<ConsolidatedBill | null>(null);

	const handleWaterAmountChange = (amount: number) => {
		if (isObjectType(consolidatedBill) && consolidatedBill.categories) {
			const waterCategory = safeGetProperty(
				consolidatedBill.categories,
				"Water",
			);
			if (isObjectType(waterCategory)) {
				const updatedBill = {
					...consolidatedBill,
					categories: {
						...consolidatedBill.categories,
						Water: {
							...waterCategory,
							amount: amount,
						},
					},
					totalAmount: Object.values({
						...consolidatedBill.categories,
						Water: {
							...waterCategory,
							amount: amount,
						},
					}).reduce((sum, category) => {
						if (isObjectType(category) && typeof category.amount === "number") {
							return sum + category.amount;
						}
						return sum;
					}, 0),
				};
				setConsolidatedBill(updatedBill);

				if (amount === 0) {
					toast.success("Water bill amount reset to $0.00");
				} else {
					toast.success(`Water bill amount updated to $${amount.toFixed(2)}`);
				}
			}
		}
	};

	// TODO: Tenants now track their own balances, so this is not needed
	const outstandingBalance = useMemo(() => {
		return billsHistory.reduce((sum, bill) => {
			if (!bill.paid && bill.tenantId) {
				const tenant = findById(tenantsList, bill.tenantId);
				if (isObjectType(tenant)) {
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

	const lastMonthTenant = useMemo(() => {
		const firstBill = lastMonthConsolidatedBill[0];
		if (isObjectType(firstBill) && firstBill.tenantId) {
			return findById(tenantsList, firstBill.tenantId);
		}
		return null;
	}, [lastMonthConsolidatedBill, tenantsList]);

	const lastMonthTenantTotal = useMemo(() => {
		const firstBill = lastMonthConsolidatedBill[0];
		if (isObjectType(firstBill) && isObjectType(lastMonthTenant)) {
			const shares = getTenantShares(firstBill, lastMonthTenant);
			return shares.tenantTotal;
		}
		return 0;
	}, [lastMonthConsolidatedBill, lastMonthTenant]);

	const paidAmount = useMemo(() => {
		return lastMonthConsolidatedBill.reduce((sum, bill) => {
			if (bill.paid && bill.tenantId) {
				const tenant = findById(tenantsList, bill.tenantId);
				if (isObjectType(tenant)) {
					const { tenantTotal } = getTenantShares(bill, tenant);
					return sum + tenantTotal;
				}
			}
			return sum;
		}, 0);
	}, [lastMonthConsolidatedBill, tenantsList]);

	useEffect(() => {
		if (tenantsList?.length > 0) {
			const firstTenant = tenantsList[0];
			if (isObjectType(firstTenant)) {
				setSelectedTenant(firstTenant);
				setConsolidatedBill(currentMonthBill);
			}
		} else if (tenantsList) {
			toast.warning("No tenants available for this user.");
			setSelectedTenant(null);
		}
	}, [setSelectedTenant, currentMonthBill, tenantsList]);

	useEffect(() => {
		if (!isObjectType(user)) return;

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
				start: startDate.toISOString().split("T")[0] ?? "",
				end: endDate.toISOString().split("T")[0] ?? "",
			};

			for (const tenant of tenantsWithOutstanding) {
				const result = await safeExecuteAsync(async () => {
					return await processTenantPayments(tenant, billsHistory, dateRange);
				});

				if (result.success) {
					if (result.data.processed) {
						toast.success(result.data.message);
					} else {
						toast.info(result.data.message);
					}
				} else {
					console.error(
						`Error processing payments for ${tenant.name}:`,
						result.error,
					);
					toast.error(`Failed to process payments for ${tenant.name}.`);
				}
			}
		};

		checkPayments();
	}, [billsHistory, tenantsList, user]);

	const handleSendBill = () => {
		if (!isObjectType(selectedTenant)) {
			toast.warning("Please select a tenant to send the bill.");
			return;
		}

		if (!isObjectType(consolidatedBill)) {
			toast.error("No bills available for the current month.");
			return;
		}
		const emailContent = constructEmail(selectedTenant, consolidatedBill);
		setEmailContent(emailContent);
		toggleDialog(DialogType.MAIN);
	};

	const confirmSendEmail = async () => {
		if (!isObjectType(emailContent)) {
			toast.error("No email content to send.");
			return;
		}
		if (!isObjectType(selectedTenant)) {
			toast.error("No tenant selected to send the bill.");
			return;
		}
		if (!isObjectType(consolidatedBill) || consolidatedBill.totalAmount <= 0) {
			toast.error("No consolidated bill available to add.");
			return;
		}
		if (!isObjectType(user) || !user.id) {
			toast.error("User ID is missing. Please log in again.");
			return;
		}

		const result = await safeExecuteAsync(async () => {
			const emailResult = await sendEmail(emailContent, selectedTenant);
			if (emailResult.success) {
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
			return emailResult;
		});

		if (!result.success) {
			console.error("Error sending email:", result.error);
			toast.error("Failed to send email. Please try again.");
		}

		toggleDialog(DialogType.MAIN);
		setEmailContent(null);
	};

	return (
		<div className="flex flex-col gap-6">
			{(() => {
				if (
					isObjectType(consolidatedBill) &&
					consolidatedBill.month !== now.getMonth() + 1
				) {
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
				title={`Welcome ${isObjectType(user) ? user.name || "User" : "User"}!`}
				subtitle={
					<Badge variant="outline" className="hidden sm:flex">
						{currentDateString}
					</Badge>
				}
			/>

			<StatsSummary
				currentMonthTotal={
					isObjectType(consolidatedBill) ? consolidatedBill.totalAmount || 0 : 0
				}
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
			{isObjectType(emailContent) && isObjectType(selectedTenant) && (
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
