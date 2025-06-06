import { CheckCircle, Clock, FileText } from "lucide-react";

import {
	Badge,
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui";
import { getTenantShares } from "@/lib/common/utils";
import { findById } from "@/lib/data";
import { ConsolidatedBill, Tenant } from "@/types";

interface LastMonthSummaryProps {
	readonly currentDate: Date;
	readonly lastMonthBills: ConsolidatedBill[];
	readonly tenantsList: Tenant[];
}

export const LastMonthSummary = ({
	currentDate,
	lastMonthBills,
	tenantsList,
}: LastMonthSummaryProps) => {
	const lastMonth = new Date(
		currentDate.getFullYear(),
		currentDate.getMonth() - 1,
		1,
	).toLocaleDateString("default", {
		month: "long",
		year: "numeric",
	});
	return (
		<Card>
			<CardHeader>
				<CardTitle>Last Month Bills</CardTitle>
				<CardDescription> {lastMonth}- Bills sent to tenants</CardDescription>
			</CardHeader>
			<CardContent>
				<div className="space-y-3">
					{lastMonthBills.map((bill, index) => {
						const tenant = findById(tenantsList, bill.tenantId);
						if (!tenant) return null;
						const { tenantTotal } = getTenantShares(bill, tenant);
						return (
							<div
								key={index}
								className="flex items-center justify-between rounded-lg border p-4">
								<div className="flex items-center gap-4">
									<div className="bg-primary/10 flex h-10 w-10 items-center justify-center rounded-full">
										<FileText className="h-5 w-5" />
									</div>
									<div>
										<p className="font-medium">{tenant?.name}</p>
										<p className="text-muted-foreground text-sm">
											Bill Total: ${bill.totalAmount} | Tenant Share: $
											{tenantTotal}
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
						);
					})}
				</div>
			</CardContent>
		</Card>
	);
};
