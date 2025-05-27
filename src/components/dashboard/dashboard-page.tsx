"use client";

import { useEffect, useState } from "react";

import { useAtom } from "jotai";
import { CheckCircle, Clock, FileText, Mail } from "lucide-react";

import { PageHeader } from "@/components/common";
import { StatsSummary } from "@/components/dashboard";
import { BillBreakdown } from "@/components/dashboard/bill-breakdown";
import {
	Badge,
	Button,
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
	Separator,
} from "@/components/ui";
import { userAtom, utilityProvidersAtom } from "@/states/store";
import { UtilityBill as Bill, User, UtilityProvider } from "@/types";

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

const tenants = [
	{
		id: "1",
		name: "John Doe",
		email: "john@example.com",
		shares: { electricity: 50, water: 50, gas: 50 },
	},
	{
		id: "2",
		name: "Jane Smith",
		email: "jane@example.com",
		shares: { electricity: 50, water: 50, gas: 50 },
	},
];

interface DashboardPageProps {
	readonly loggedInUser: User;
	readonly utilityProviders: UtilityProvider[];
	readonly currentMonthBills: Bill[];
}

export const DashboardPage = ({
	loggedInUser,
	utilityProviders,
	currentMonthBills,
}: DashboardPageProps) => {
	const currentDate = new Date();
	const [user, setUser] = useAtom(userAtom);
	const [providersList, setProvidersList] = useAtom(utilityProvidersAtom);
	const [selectedTenant, setSelectedTenant] = useState("");
	const [emailDialogOpen, setEmailDialogOpen] = useState(false);
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const [billToSend, setBillToSend] = useState<any>(null);
	const [currentMonthBill, setCurrentMonthBill] = useState<Bill[]>([]);

	// const handleSendBill = () => {
	// 	const tenant = tenants.find((t) => t.id === selectedTenant);
	// 	if (tenant) {
	// 		// Calculate tenant's share for each category
	// 		const tenantShares = {
	// 			electricity:
	// 				(currentMonthBill.categories.electricity.amount *
	// 					tenant.shares.electricity) /
	// 				100,
	// 			water:
	// 				(currentMonthBill.categories.water.amount * tenant.shares.water) /
	// 				100,
	// 			gas: (currentMonthBill.categories.gas.amount * tenant.shares.gas) / 100,
	// 		};

	// 		const tenantTotalShare = Object.values(tenantShares).reduce(
	// 			(sum, share) => sum + share,
	// 			0,
	// 		);

	// 		setBillToSend({
	// 			...currentMonthBill,
	// 			tenant,
	// 			tenantShares,
	// 			tenantTotalShare,
	// 		});
	// 		setEmailDialogOpen(true);
	// 	}
	// };

	const confirmSendEmail = () => {
		console.log("Sending consolidated bill email to:", billToSend.tenant.email);
		console.log("Bill details:", billToSend);
		setEmailDialogOpen(false);
		setBillToSend(null);
		setSelectedTenant("");
	};

	// const lastMonthTotal = lastMonthBills.reduce(
	// 	(sum, bill) => sum + bill.tenantTotalShare,
	// 	0,
	// );
	// const paidAmount = lastMonthBills
	// 	.filter((bill) => bill.paid)
	// 	.reduce((sum, bill) => sum + bill.tenantTotalShare, 0);
	// const unpaidAmount = lastMonthTotal - paidAmount;

	// Initialize user and providers if not already set
	useEffect(() => {
		if (!user) setUser(loggedInUser);
		if (!providersList.length) setProvidersList(utilityProviders);
	}, [
		user,
		providersList,
		loggedInUser,
		utilityProviders,
		setUser,
		setProvidersList,
	]);

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
									value={selectedTenant}
									onValueChange={setSelectedTenant}>
									<SelectTrigger className="w-48">
										<SelectValue placeholder="Select tenant to bill" />
									</SelectTrigger>
									<SelectContent>
										{tenants.map((tenant) => (
											<SelectItem key={tenant.id} value={tenant.id}>
												{tenant.name}
											</SelectItem>
										))}
									</SelectContent>
								</Select>

								<Button
									onClick={() => console.log("send bills...")}
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
			<Dialog open={emailDialogOpen} onOpenChange={setEmailDialogOpen}>
				<DialogContent className="max-w-2xl">
					<DialogHeader>
						<DialogTitle>
							Send Consolidated Bill to {billToSend?.tenant?.name}
						</DialogTitle>
						<DialogDescription>
							Review the bill details before sending to{" "}
							{billToSend?.tenant?.email}
						</DialogDescription>
					</DialogHeader>

					{billToSend && (
						<div className="space-y-6">
							<div className="bg-muted rounded-lg p-4">
								<h4 className="mb-4 font-medium">
									Bill Summary for {billToSend.month}
								</h4>

								<div className="space-y-3">
									<div className="flex items-center justify-between">
										<span className="font-medium">Electricity</span>
										<div className="text-right">
											<p className="font-medium">
												${billToSend.tenantShares.electricity.toFixed(2)}
											</p>
											<p className="text-muted-foreground text-xs">
												{billToSend.tenant.shares.electricity}% of $
												{billToSend.categories.electricity.amount}
											</p>
										</div>
									</div>

									<div className="flex items-center justify-between">
										<span className="font-medium">Water</span>
										<div className="text-right">
											<p className="font-medium">
												${billToSend.tenantShares.water.toFixed(2)}
											</p>
											<p className="text-muted-foreground text-xs">
												{billToSend.tenant.shares.water}% of $
												{billToSend.categories.water.amount}
											</p>
										</div>
									</div>

									<div className="flex items-center justify-between">
										<span className="font-medium">Gas</span>
										<div className="text-right">
											<p className="font-medium">
												${billToSend.tenantShares.gas.toFixed(2)}
											</p>
											<p className="text-muted-foreground text-xs">
												{billToSend.tenant.shares.gas}% of $
												{billToSend.categories.gas.amount}
											</p>
										</div>
									</div>

									<Separator />

									<div className="flex items-center justify-between">
										<span className="text-lg font-semibold">
											Total Amount Due
										</span>
										<span className="text-primary text-lg font-bold">
											${billToSend.tenantTotalShare.toFixed(2)}
										</span>
									</div>
								</div>
							</div>

							<div className="rounded-lg border bg-blue-50 p-4">
								<h5 className="mb-2 font-medium">Email Preview</h5>
								<p className="text-muted-foreground text-sm">
									This bill breakdown will be sent to {billToSend.tenant.email}{" "}
									with payment instructions and due date information.
								</p>
							</div>
						</div>
					)}

					<DialogFooter>
						<Button variant="outline" onClick={() => setEmailDialogOpen(false)}>
							Cancel
						</Button>
						<Button onClick={confirmSendEmail}>
							<Mail className="mr-1 h-4 w-4" />
							Send Email
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
};
