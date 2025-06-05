"use client";

import { useState } from "react";

import { useAtom } from "jotai";
import {
	Calendar,
	CheckCircle,
	Clock,
	DollarSign,
	Eye,
	FileText,
	Zap,
} from "lucide-react";
import { toast } from "sonner";

import {
	Badge,
	Button,
	Card,
	CardContent,
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
	Separator,
} from "@/components/ui";
import { getTenantShares } from "@/lib/common/utils";
import { findById } from "@/lib/data";
import { billsHistoryAtom, tenantsAtom } from "@/states";

export const BillsHistoryPage = () => {
	const [filterMonth, setFilterMonth] = useState("all");
	const [filterStatus, setFilterStatus] = useState("all");
	const [billsHistory] = useAtom(billsHistoryAtom);
	const [tenantsList] = useAtom(tenantsAtom);
	const filteredBills = billsHistory.filter((bill) => {
		const monthMatch =
			filterMonth === "all" || bill.month.toString() === filterMonth;
		const statusMatch =
			filterStatus === "all" ||
			(filterStatus === "paid" && bill.paid) ||
			(filterStatus === "unpaid" && !bill.paid);
		return monthMatch && statusMatch;
	});

	const uniqueMonths = [...new Set(billsHistory.map((bill) => bill.month))];

	return (
		<div className="space-y-6">
			<div>
				<h1 className="text-3xl font-bold">Bills History</h1>
				<p className="text-muted-foreground">
					View and track all consolidated utility bills sent to tenants
				</p>
			</div>

			{/* Summary Stats */}
			<div className="grid gap-4 md:grid-cols-3">
				<Card>
					<CardContent className="p-4">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-muted-foreground text-sm">
									Total Bills Sent
								</p>
								<p className="text-2xl font-bold">{billsHistory.length}</p>
							</div>
							<FileText className="text-muted-foreground h-8 w-8" />
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardContent className="p-4">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-muted-foreground text-sm">
									Total Amount Billed
								</p>
								<p className="text-2xl font-bold">
									$
									{billsHistory
										.reduce((sum, bill) => {
											const tenant = findById(tenantsList, bill.tenantId);
											if (!tenant) return sum;
											const tenantShares = getTenantShares(bill, tenant);
											return sum + (tenantShares?.tenantTotal || 0);
										}, 0)
										.toFixed(2)}
								</p>
							</div>
							<DollarSign className="text-muted-foreground h-8 w-8" />
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardContent className="p-4">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-muted-foreground text-sm">Collection Rate</p>
								<p className="text-2xl font-bold">
									{Math.round(
										(billsHistory.filter((b) => b.paid).length /
											billsHistory.length) *
											100,
									)}
									%
								</p>
							</div>
							<CheckCircle className="h-8 w-8 text-green-600" />
						</div>
					</CardContent>
				</Card>
			</div>

			{/* Filters */}
			<div className="flex gap-4">
				<Select value={filterMonth} onValueChange={setFilterMonth}>
					<SelectTrigger className="w-[200px]">
						<SelectValue placeholder="Filter by month" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="all">All Months</SelectItem>
						{uniqueMonths.map((month) => (
							<SelectItem key={month} value={month.toString()}>
								{month}
							</SelectItem>
						))}
					</SelectContent>
				</Select>

				<Select value={filterStatus} onValueChange={setFilterStatus}>
					<SelectTrigger className="w-[200px]">
						<SelectValue placeholder="Filter by status" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="all">All Status</SelectItem>
						<SelectItem value="paid">Paid</SelectItem>
						<SelectItem value="unpaid">Unpaid</SelectItem>
					</SelectContent>
				</Select>
			</div>

			{/* Bills List */}
			<div className="space-y-4">
				{filteredBills.map((bill) => {
					const tenant = findById(tenantsList, bill.tenantId);
					if (!tenant) return null;
					const { tenantTotal, shares } = getTenantShares(bill, tenant);
					return (
						<Card key={bill.id}>
							<CardContent className="p-6">
								<div className="flex items-center justify-between">
									<div className="flex items-center gap-4">
										<div className="bg-primary/10 flex h-12 w-12 items-center justify-center rounded-lg">
											<FileText className="h-6 w-6" />
										</div>

										<div className="space-y-1">
											<div className="flex items-center gap-2">
												<h3 className="font-semibold">
													{new Date(bill.year, bill.month, 0).toLocaleString(
														"default",
														{
															month: "long",
															year: "numeric",
														},
													)}
												</h3>
												<Badge variant="outline">{tenant.name}</Badge>
											</div>
											<div className="text-muted-foreground flex items-center gap-6 text-sm">
												<div className="flex items-center gap-1">
													<DollarSign className="h-3 w-3" />
													Total Bill: ${bill.totalAmount}
												</div>
												<div className="flex items-center gap-1">
													<DollarSign className="h-3 w-3" />
													Tenant Share: ${tenantTotal}
												</div>
												<div className="flex items-center gap-1">
													<Calendar className="h-3 w-3" />
													Sent:{" "}
													{bill.dateSent
														? new Date(bill.dateSent).toLocaleDateString()
														: "N/A"}
												</div>
												{bill.datePaid && (
													<div className="flex items-center gap-1">
														<CheckCircle className="h-3 w-3" />
														Paid: {new Date(bill.datePaid).toLocaleDateString()}
													</div>
												)}
											</div>
										</div>
									</div>

									<div className="flex items-center gap-4">
										<div className="text-right">
											<p className="text-lg font-bold">${tenantTotal}</p>
											<p className="text-muted-foreground text-sm">
												{((tenantTotal / bill.totalAmount) * 100).toFixed(0)}%
												of total
											</p>
										</div>

										<Dialog>
											<DialogTrigger asChild>
												<Button
													variant="outline"
													size="sm"
													onClick={() => {
														toast.warning("bill details ");
													}}>
													<Eye className="mr-1 h-4 w-4" />
													View Details
												</Button>
											</DialogTrigger>
											<DialogContent className="max-w-2xl">
												<DialogHeader>
													<DialogTitle>Bill Details - {bill.month}</DialogTitle>
													<DialogDescription>
														Consolidated bill sent to {tenant.email}
													</DialogDescription>
												</DialogHeader>

												<div className="space-y-6">
													<div className="grid gap-4 md:grid-cols-3">
														<div className="rounded-lg border p-4">
															<div className="mb-2 flex items-center justify-between">
																<h4 className="font-medium">Electricity</h4>
																<Zap className="h-4 w-4 text-yellow-600" />
															</div>
															<p className="text-xl font-bold">
																${bill.categories.Electricity.amount}
															</p>
															<p className="text-muted-foreground mb-2 text-sm">
																{bill.categories.Electricity.providerName}
															</p>
															<div className="text-sm">
																<p className="font-medium">
																	Tenant Share: ${shares.Electricity}
																</p>
																<p className="text-muted-foreground">
																	{shares.Electricity}% share
																</p>
															</div>
														</div>

														<div className="rounded-lg border p-4">
															<div className="mb-2 flex items-center justify-between">
																<h4 className="font-medium">Water</h4>
																<div className="h-4 w-4 rounded-full bg-blue-600"></div>
															</div>
															<p className="text-xl font-bold">
																${bill.categories.Water.amount}
															</p>
															<p className="text-muted-foreground mb-2 text-sm">
																{bill.categories.Water.providerName}
															</p>
															<div className="text-sm">
																<p className="font-medium">
																	Tenant Share: ${shares.Water}
																</p>
																<p className="text-muted-foreground">
																	{shares.Water}% share
																</p>
															</div>
														</div>

														<div className="rounded-lg border p-4">
															<div className="mb-2 flex items-center justify-between">
																<h4 className="font-medium">Gas</h4>
																<div className="h-4 w-4 rounded-full bg-orange-600"></div>
															</div>
															<p className="text-xl font-bold">
																${bill.categories.Gas.amount}
															</p>
															<p className="text-muted-foreground mb-2 text-sm">
																{bill.categories.Gas.providerName}
															</p>
															<div className="text-sm">
																<p className="font-medium">
																	Tenant Share: ${shares.Gas}
																</p>
																<p className="text-muted-foreground">
																	{shares.Gas}% share
																</p>
															</div>
														</div>
													</div>

													<Separator />

													<div className="bg-muted flex items-center justify-between rounded-lg p-4">
														<div>
															<p className="text-muted-foreground text-sm">
																Total Amount Due
															</p>
															<p className="text-2xl font-bold">
																${tenantTotal}
															</p>
														</div>
														<div className="text-right">
															<p className="text-muted-foreground text-sm">
																Bill Status
															</p>
															<Badge
																variant={bill.paid ? "default" : "destructive"}
																className="text-sm">
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
													</div>
												</div>
											</DialogContent>
										</Dialog>

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
								</div>
							</CardContent>
						</Card>
					);
				})}
			</div>

			{filteredBills.length === 0 && (
				<Card>
					<CardContent className="flex flex-col items-center justify-center py-12">
						<FileText className="text-muted-foreground mb-4 h-12 w-12" />
						<h3 className="mb-2 text-lg font-medium">No bills found</h3>
						<p className="text-muted-foreground text-center">
							No bills match your current filter criteria
						</p>
					</CardContent>
				</Card>
			)}
		</div>
	);
};
