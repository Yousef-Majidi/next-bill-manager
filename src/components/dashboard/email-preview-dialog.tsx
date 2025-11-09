"use client";

import { Droplets, Flame, Mail, Send, Zap } from "lucide-react";

import {
	Badge,
	Button,
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	Separator,
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui";
import { getTenantShares } from "@/lib/common/utils";
import { ConsolidatedBill, EmailContent, Tenant } from "@/types";

interface EmailPreviewDialogProps {
	readonly isOpen: boolean;
	readonly tenant: Tenant;
	readonly emailContent: EmailContent;
	readonly consolidatedBill: ConsolidatedBill;
	readonly onClose: () => void;
	readonly onConfirm: () => void;
}

export const EmailPreviewDialog: React.FC<EmailPreviewDialogProps> = ({
	isOpen,
	tenant,
	emailContent,
	consolidatedBill,
	onClose,
	onConfirm,
}) => {
	const { shares, tenantTotal } = getTenantShares(consolidatedBill, tenant);
	const outstandingBalance = tenant.outstandingBalance;
	const finalAmountDue = tenantTotal + outstandingBalance;

	const getCategoryIcon = (category: string) => {
		switch (category.toLowerCase()) {
			case "electricity":
				return <Zap className="h-4 w-4 text-yellow-600" />;
			case "water":
				return <Droplets className="h-4 w-4 text-blue-600" />;
			case "gas":
				return <Flame className="h-4 w-4 text-orange-600" />;
			default:
				return <Zap className="h-4 w-4 text-gray-600" />;
		}
	};

	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent className="max-w-4xl">
				<DialogHeader>
					<div className="flex items-center gap-3">
						<div className="rounded-xl bg-gradient-to-r from-blue-100 to-indigo-100 p-3">
							<Mail className="h-6 w-6 text-blue-600" />
						</div>
						<div>
							<DialogTitle className="text-xl font-semibold text-gray-900">
								Email Preview
							</DialogTitle>
							<DialogDescription className="text-gray-600">
								Review the email details before sending to {tenant.name}
							</DialogDescription>
						</div>
					</div>
				</DialogHeader>

				<div className="space-y-6">
					{/* Email Details */}
					<div className="rounded-lg bg-gray-50 p-4">
						<div className="grid gap-3">
							<div className="flex items-center gap-2">
								<span className="text-sm font-medium text-gray-600">
									Subject:
								</span>
								<span className="font-semibold text-gray-900">
									{emailContent.subject}
								</span>
							</div>
							<div className="flex items-center gap-2">
								<span className="text-sm font-medium text-gray-600">To:</span>
								<span className="font-semibold text-gray-900">
									{tenant.email}
								</span>
							</div>
						</div>
					</div>

					{/* Bill Breakdown Table */}
					<div className="space-y-4">
						<h3 className="text-lg font-semibold text-gray-900">
							Bill Breakdown
						</h3>
						<div className="overflow-hidden rounded-lg border">
							<Table>
								<TableHeader>
									<TableRow className="bg-gray-50">
										<TableHead className="font-semibold">Provider</TableHead>
										<TableHead className="text-right font-semibold">
											Total Amount
										</TableHead>
										<TableHead className="text-right font-semibold">
											Your % Share
										</TableHead>
										<TableHead className="text-right font-semibold">
											Your $ Share
										</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{Object.entries(consolidatedBill.categories).map(
										([category, details]) => {
											const total = details.amount;
											const tenantShare =
												shares[category as keyof typeof shares] ?? 0;
											const percent =
												total > 0
													? ((tenantShare / total) * 100).toFixed(1)
													: "0.0";

											return (
												<TableRow key={category}>
													<TableCell>
														<div className="flex items-center gap-2">
															{getCategoryIcon(category)}
															<span className="font-medium">
																{category} - {details.providerName}
															</span>
														</div>
													</TableCell>
													<TableCell className="text-right font-medium">
														${total.toFixed(2)}
													</TableCell>
													<TableCell className="text-right">
														<Badge
															variant="outline"
															className="border-blue-200 bg-blue-50 text-blue-700">
															{percent}%
														</Badge>
													</TableCell>
													<TableCell className="text-right font-semibold">
														${tenantShare.toFixed(2)}
													</TableCell>
												</TableRow>
											);
										},
									)}
								</TableBody>
							</Table>
						</div>

						{/* Summary Section */}
						<div className="rounded-lg bg-gradient-to-r from-gray-50 to-gray-100 p-4">
							<div className="space-y-3">
								<div className="flex items-center justify-between">
									<span className="font-medium text-gray-700">
										Your share for this month:
									</span>
									<span className="text-lg font-bold text-gray-900">
										${tenantTotal.toFixed(2)}
									</span>
								</div>
								<div className="flex items-center justify-between">
									<span className="font-medium text-gray-700">
										{outstandingBalance < 0
											? "Credit balance:"
											: "Outstanding balance:"}
									</span>
									<span
										className={`text-lg font-bold ${outstandingBalance < 0 ? "text-green-600" : "text-red-600"}`}>
										{outstandingBalance < 0
											? `-$${Math.abs(outstandingBalance).toFixed(2)}`
											: `$${outstandingBalance.toFixed(2)}`}
									</span>
								</div>
								<Separator />
								<div className="flex items-center justify-between">
									<span className="font-semibold text-gray-900">
										Total Amount Due:
									</span>
									<span className="text-xl font-bold text-blue-600">
										${Math.max(0, finalAmountDue).toFixed(2)}
									</span>
								</div>
							</div>
						</div>
					</div>
				</div>

				<DialogFooter className="gap-3">
					<Button
						variant="outline"
						onClick={onClose}
						className="border-gray-200 hover:bg-gray-50">
						Cancel
					</Button>
					<Button
						onClick={onConfirm}
						className="border-0 bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg transition-all duration-200 hover:from-blue-700 hover:to-indigo-700 hover:shadow-xl">
						<Send className="mr-2 h-4 w-4" />
						Send Email
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};
