"use client";

import { useState } from "react";

import {
	Calendar,
	CheckCircle,
	Clock,
	DollarSign,
	Eye,
	FileText,
	Zap,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";

const billsHistory = [
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
			electricity: 70,
			water: 37.5,
			gas: 55,
		},
		sharePercentages: {
			electricity: 50,
			water: 50,
			gas: 50,
		},
		paid: true,
		dateSent: "2024-11-05",
		datePaid: "2024-11-12",
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
			electricity: 70,
			water: 37.5,
			gas: 55,
		},
		sharePercentages: {
			electricity: 50,
			water: 50,
			gas: 50,
		},
		paid: false,
		dateSent: "2024-11-05",
		datePaid: null,
	},
	{
		id: "3",
		month: "October 2024",
		categories: {
			electricity: { amount: 135, provider: "City Electric" },
			water: { amount: 80, provider: "Metro Water" },
			gas: { amount: 95, provider: "Natural Gas Co" },
		},
		totalAmount: 310,
		tenant: "John Doe",
		tenantTotalShare: 155,
		tenantShares: {
			electricity: 67.5,
			water: 40,
			gas: 47.5,
		},
		sharePercentages: {
			electricity: 50,
			water: 50,
			gas: 50,
		},
		paid: true,
		dateSent: "2024-10-05",
		datePaid: "2024-10-15",
	},
	{
		id: "4",
		month: "October 2024",
		categories: {
			electricity: { amount: 135, provider: "City Electric" },
			water: { amount: 80, provider: "Metro Water" },
			gas: { amount: 95, provider: "Natural Gas Co" },
		},
		totalAmount: 310,
		tenant: "Jane Smith",
		tenantTotalShare: 155,
		tenantShares: {
			electricity: 67.5,
			water: 40,
			gas: 47.5,
		},
		sharePercentages: {
			electricity: 50,
			water: 50,
			gas: 50,
		},
		paid: true,
		dateSent: "2024-10-05",
		datePaid: "2024-10-18",
	},
];

export default function BillsPage() {
	const [filterMonth, setFilterMonth] = useState("all");
	const [filterStatus, setFilterStatus] = useState("all");

	// eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars
	const [selectedBill, setSelectedBill] = useState<any>(null);

	const filteredBills = billsHistory.filter((bill) => {
		const monthMatch = filterMonth === "all" || bill.month === filterMonth;
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
										.reduce((sum, bill) => sum + bill.tenantTotalShare, 0)
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
							<SelectItem key={month} value={month}>
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
				{filteredBills.map((bill) => (
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
												Consolidated Bill - {bill.month}
											</h3>
											<Badge variant="outline">{bill.tenant}</Badge>
										</div>
										<div className="text-muted-foreground flex items-center gap-6 text-sm">
											<div className="flex items-center gap-1">
												<DollarSign className="h-3 w-3" />
												Total Bill: ${bill.totalAmount}
											</div>
											<div className="flex items-center gap-1">
												<DollarSign className="h-3 w-3" />
												Tenant Share: ${bill.tenantTotalShare}
											</div>
											<div className="flex items-center gap-1">
												<Calendar className="h-3 w-3" />
												Sent: {new Date(bill.dateSent).toLocaleDateString()}
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
										<p className="text-lg font-bold">
											${bill.tenantTotalShare}
										</p>
										<p className="text-muted-foreground text-sm">
											{(
												(bill.tenantTotalShare / bill.totalAmount) *
												100
											).toFixed(0)}
											% of total
										</p>
									</div>

									<Dialog>
										<DialogTrigger asChild>
											<Button
												variant="outline"
												size="sm"
												onClick={() => setSelectedBill(bill)}>
												<Eye className="mr-1 h-4 w-4" />
												View Details
											</Button>
										</DialogTrigger>
										<DialogContent className="max-w-2xl">
											<DialogHeader>
												<DialogTitle>Bill Details - {bill.month}</DialogTitle>
												<DialogDescription>
													Consolidated bill sent to {bill.tenant}
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
															${bill.categories.electricity.amount}
														</p>
														<p className="text-muted-foreground mb-2 text-sm">
															{bill.categories.electricity.provider}
														</p>
														<div className="text-sm">
															<p className="font-medium">
																Tenant Share: ${bill.tenantShares.electricity}
															</p>
															<p className="text-muted-foreground">
																{bill.sharePercentages.electricity}% share
															</p>
														</div>
													</div>

													<div className="rounded-lg border p-4">
														<div className="mb-2 flex items-center justify-between">
															<h4 className="font-medium">Water</h4>
															<div className="h-4 w-4 rounded-full bg-blue-600"></div>
														</div>
														<p className="text-xl font-bold">
															${bill.categories.water.amount}
														</p>
														<p className="text-muted-foreground mb-2 text-sm">
															{bill.categories.water.provider}
														</p>
														<div className="text-sm">
															<p className="font-medium">
																Tenant Share: ${bill.tenantShares.water}
															</p>
															<p className="text-muted-foreground">
																{bill.sharePercentages.water}% share
															</p>
														</div>
													</div>

													<div className="rounded-lg border p-4">
														<div className="mb-2 flex items-center justify-between">
															<h4 className="font-medium">Gas</h4>
															<div className="h-4 w-4 rounded-full bg-orange-600"></div>
														</div>
														<p className="text-xl font-bold">
															${bill.categories.gas.amount}
														</p>
														<p className="text-muted-foreground mb-2 text-sm">
															{bill.categories.gas.provider}
														</p>
														<div className="text-sm">
															<p className="font-medium">
																Tenant Share: ${bill.tenantShares.gas}
															</p>
															<p className="text-muted-foreground">
																{bill.sharePercentages.gas}% share
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
															${bill.tenantTotalShare}
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
				))}
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
}
