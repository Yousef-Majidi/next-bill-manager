"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { useAtom } from "jotai";
import { Calendar, User } from "lucide-react";
import { toast } from "sonner";

import {
	ConsolidatedBillSection,
	MonthSelector,
	StatsSummary,
} from "@/components/dashboard";
import { EmailPreviewDialog } from "@/components/dashboard/email-preview-dialog";
import { LastMonthSummary } from "@/components/dashboard/last-month-summary";
import { fetchMonthData } from "@/features/dashboard/actions";
import { DialogType, useDialogState } from "@/hooks";
import { safeExecuteAsync } from "@/lib/common/error-handling";
import { isObjectType, safeGetProperty } from "@/lib/common/type-utils";
import { getTenantShares } from "@/lib/common/utils";
import { addConsolidatedBill, findById, updateTenantBalance } from "@/lib/data";
import { constructEmail, processTenantPayments, sendEmail } from "@/lib/gmail";
import { billsHistoryAtom, tenantsAtom, userAtom } from "@/states/store";
import { ConsolidatedBill, EmailContent, Tenant } from "@/types";

interface DashboardPageProps {
	readonly currentMonthBill: ConsolidatedBill | null;
}

export const DashboardPage = ({ currentMonthBill }: DashboardPageProps) => {
	const router = useRouter();
	const searchParams = useSearchParams();
	const now = useMemo(() => new Date(), []);
	const currentDateString = now.toLocaleDateString("en-US", {
		month: "long",
		day: "numeric",
		year: "numeric",
	});

	// Get month/year from URL params or default to current month
	const selectedMonth = useMemo(() => {
		const monthParam = searchParams?.get("month");
		return monthParam ? parseInt(monthParam, 10) : now.getMonth() + 1;
	}, [searchParams, now]);

	const selectedYear = useMemo(() => {
		const yearParam = searchParams?.get("year");
		return yearParam ? parseInt(yearParam, 10) : now.getFullYear();
	}, [searchParams, now]);

	const isCurrentMonth = useMemo(() => {
		return (
			selectedMonth === now.getMonth() + 1 && selectedYear === now.getFullYear()
		);
	}, [selectedMonth, selectedYear, now]);

	const canGoPrevious = useMemo(() => {
		const selectedDate = new Date(selectedYear, selectedMonth - 1, 1);
		const twoYearsAgo = new Date(now.getFullYear() - 2, now.getMonth(), 1);
		return selectedDate > twoYearsAgo;
	}, [selectedMonth, selectedYear, now]);

	const [user] = useAtom(userAtom);
	const [tenantsList] = useAtom(tenantsAtom);
	const [billsHistory] = useAtom(billsHistoryAtom);
	const { mainDialogOpen, toggleDialog } = useDialogState();
	const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);
	const [emailContent, setEmailContent] = useState<EmailContent | null>(null);
	const [consolidatedBill, setConsolidatedBill] =
		useState<ConsolidatedBill | null>(currentMonthBill);
	const [isLoading, setIsLoading] = useState(false);

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
		const prevMonth = new Date(selectedYear, selectedMonth - 2, 1);
		const lastMonthYear = prevMonth.getFullYear();
		const lastMonthMonth = prevMonth.getMonth();

		return billsHistory.filter((bill) => {
			const billDate = new Date(bill.year, bill.month - 1, 1);
			return (
				billDate.getFullYear() === lastMonthYear &&
				billDate.getMonth() === lastMonthMonth
			);
		});
	}, [billsHistory, selectedMonth, selectedYear]);

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

	// Fetch month data when URL params change
	useEffect(() => {
		const fetchData = async () => {
			// Only fetch if not current month or if we have URL params
			const hasUrlParams =
				searchParams?.get("month") && searchParams?.get("year");

			// Check if the prop bill matches the selected month
			const propBillMatchesSelected =
				currentMonthBill &&
				currentMonthBill.month === selectedMonth &&
				currentMonthBill.year === selectedYear;

			if (!hasUrlParams && isCurrentMonth) {
				// Initial load with current month - use prop
				setConsolidatedBill(currentMonthBill);
				return;
			}

			// If we have URL params and the prop bill matches the selected month, use it
			// This prevents unnecessary refetch when server already provided the correct bill
			if (hasUrlParams && propBillMatchesSelected && currentMonthBill) {
				if (consolidatedBill !== currentMonthBill) {
					setConsolidatedBill(currentMonthBill);
				}
				return;
			}

			// First, check if we already have the bill in billsHistory
			// Note: billsHistory may have multiple bills for the same month (different tenants)
			// We'll use the first one found (they should have the same totals)
			const billFromHistory = billsHistory.find(
				(bill) => bill.month === selectedMonth && bill.year === selectedYear,
			);

			if (billFromHistory) {
				// Create a copy without tenantId for display purposes
				// (we want to show the bill even if it was sent to a specific tenant)
				const displayBill: ConsolidatedBill = {
					...billFromHistory,
					tenantId: null,
				};
				setConsolidatedBill(displayBill);
				return;
			}

			// If not in history, fetch from server
			setIsLoading(true);
			const result = await safeExecuteAsync(async () => {
				return await fetchMonthData(selectedMonth, selectedYear);
			});

			setIsLoading(false);

			if (result.success && result.data) {
				// Type narrowing: result.data is the return type of fetchMonthData
				// which is { consolidatedBill: ConsolidatedBill | null }
				// Convert to unknown first to avoid type mismatch
				const monthData = result.data as unknown as {
					consolidatedBill: ConsolidatedBill | null;
				};
				// Only update if we got a bill, otherwise keep existing bill if it matches
				if (monthData.consolidatedBill) {
					setConsolidatedBill(monthData.consolidatedBill);
				} else {
					// If fetch returned null but we have a bill that matches, keep it
					const existingBillMatches =
						consolidatedBill &&
						consolidatedBill.month === selectedMonth &&
						consolidatedBill.year === selectedYear;
					if (!existingBillMatches) {
						setConsolidatedBill(null);
					}
				}
			} else if (!result.success) {
				const errorMessage =
					result.error?.message || "Failed to fetch month data";
				toast.error(errorMessage);
				// Don't overwrite existing bill if it matches
				const existingBillMatches =
					consolidatedBill &&
					consolidatedBill.month === selectedMonth &&
					consolidatedBill.year === selectedYear;
				if (!existingBillMatches) {
					setConsolidatedBill(null);
				}
			} else {
				// Don't overwrite existing bill if it matches
				const existingBillMatches =
					consolidatedBill &&
					consolidatedBill.month === selectedMonth &&
					consolidatedBill.year === selectedYear;
				if (!existingBillMatches) {
					setConsolidatedBill(null);
				}
			}
		};

		fetchData();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [selectedMonth, selectedYear, billsHistory, currentMonthBill]);

	useEffect(() => {
		if (tenantsList?.length > 0) {
			const firstTenant = tenantsList[0];
			if (isObjectType(firstTenant)) {
				setSelectedTenant(firstTenant);
			}
		} else if (tenantsList) {
			toast.warning("No tenants available for this user.");
			setSelectedTenant(null);
		}
	}, [setSelectedTenant, tenantsList]);

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

	const handlePreviousMonth = () => {
		const prevDate = new Date(selectedYear, selectedMonth - 2, 1);
		const params = new URLSearchParams(searchParams?.toString() ?? "");
		params.set("month", (prevDate.getMonth() + 1).toString());
		params.set("year", prevDate.getFullYear().toString());
		router.push(`/dashboard?${params.toString()}`);
	};

	const handleNextMonth = () => {
		const nextDate = new Date(selectedYear, selectedMonth, 1);
		const params = new URLSearchParams(searchParams?.toString() ?? "");
		params.set("month", (nextDate.getMonth() + 1).toString());
		params.set("year", nextDate.getFullYear().toString());
		router.push(`/dashboard?${params.toString()}`);
	};

	const handleResetToCurrentMonth = () => {
		router.push("/dashboard");
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

		// Send email first
		const emailResult = await sendEmail(emailContent, selectedTenant);

		// Show demo mode toast if applicable
		if (
			emailResult.success &&
			"demoMode" in emailResult &&
			emailResult.demoMode
		) {
			toast.info(
				"Demo mode: Email sending is disabled. In production, this would send an email to the tenant.",
			);
		}

		if (emailResult.success) {
			// Email sent successfully, now try to save the bill
			try {
				const billToSave = {
					...consolidatedBill,
					tenantId: selectedTenant.id,
					dateSent: new Date().toISOString(),
				};

				const newBill = await addConsolidatedBill(user.id, billToSave);
				if (newBill.acknowledged) {
					// Update tenant's outstanding balance with their share of the bill
					const { tenantTotal } = getTenantShares(billToSave, selectedTenant);
					const newOutstandingBalance =
						selectedTenant.outstandingBalance + tenantTotal;

					try {
						await updateTenantBalance(
							user.id,
							selectedTenant.id,
							newOutstandingBalance,
						);
						console.log("Updated tenant balance:", {
							tenantId: selectedTenant.id,
							tenantName: selectedTenant.name,
							previousBalance: selectedTenant.outstandingBalance,
							billShare: tenantTotal,
							newBalance: newOutstandingBalance,
						});
					} catch (balanceError) {
						console.error("Failed to update tenant balance:", balanceError);
						// Don't fail the whole operation if balance update fails
					}

					toast.success(
						`Email sent and bill added for ${selectedTenant.name}!`,
					);
				} else {
					console.error(
						"Bill save failed - acknowledged:",
						newBill.acknowledged,
					);
					toast.warning(
						`Email sent to ${selectedTenant.name}, but failed to save bill record.`,
					);
				}
			} catch (dbError) {
				// Database save failed, but email was sent successfully
				console.error("Failed to save bill after email sent:", {
					error: dbError,
					errorMessage:
						dbError instanceof Error ? dbError.message : String(dbError),
					errorStack: dbError instanceof Error ? dbError.stack : undefined,
					billData: {
						userId: user.id,
						year: consolidatedBill.year,
						month: consolidatedBill.month,
						tenantId: selectedTenant.id,
						totalAmount: consolidatedBill.totalAmount,
					},
				});
				toast.warning(
					`Email sent to ${selectedTenant.name}, but failed to save bill record.`,
				);
			}
		} else {
			// Email failed to send
			toast.error(`Failed to send email to ${selectedTenant.name}.`);
		}

		toggleDialog(DialogType.MAIN);
		setEmailContent(null);
	};

	return (
		<div className="flex flex-col gap-6">
			{/* Custom Header */}
			<div className="flex flex-col gap-2">
				<div className="flex items-center gap-3">
					<div className="rounded-xl bg-gradient-to-r from-blue-100 to-indigo-100 p-3">
						<User className="h-6 w-6 text-blue-600" />
					</div>
					<div>
						<h1 className="text-3xl font-bold tracking-tight text-gray-900">
							Welcome {isObjectType(user) ? user.name || "User" : "User"}!
						</h1>
						<p className="mt-1 text-gray-600">
							Manage your utility bills and tenant communications
						</p>
					</div>
				</div>
				<div className="flex items-center gap-2 text-sm text-gray-500">
					<Calendar className="h-4 w-4" />
					<span>{currentDateString}</span>
				</div>
			</div>

			{/* Month Selector */}
			<MonthSelector
				month={selectedMonth}
				year={selectedYear}
				onPrevious={handlePreviousMonth}
				onNext={handleNextMonth}
				onReset={handleResetToCurrentMonth}
				isCurrentMonth={isCurrentMonth}
				canGoPrevious={canGoPrevious}
			/>

			{isLoading && (
				<div className="flex items-center justify-center py-8">
					<div className="text-gray-600">Loading month data...</div>
				</div>
			)}

			<StatsSummary
				currentMonthTotal={
					isObjectType(consolidatedBill) ? consolidatedBill.totalAmount || 0 : 0
				}
				lastMonthTotal={lastMonthTenantTotal}
				outstandingBalance={outstandingBalance}
				paidAmount={paidAmount}
				selectedMonth={selectedMonth}
				selectedYear={selectedYear}
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
				selectedMonth={selectedMonth}
				selectedYear={selectedYear}
				lastMonthBills={lastMonthConsolidatedBill}
				tenantsList={tenantsList}
			/>

			{/* Email Confirmation Dialog */}
			{isObjectType(emailContent) &&
				isObjectType(selectedTenant) &&
				isObjectType(consolidatedBill) && (
					<EmailPreviewDialog
						isOpen={mainDialogOpen}
						tenant={selectedTenant}
						emailContent={emailContent}
						consolidatedBill={consolidatedBill}
						onClose={() => toggleDialog(DialogType.MAIN)}
						onConfirm={confirmSendEmail}
					/>
				)}
		</div>
	);
};
