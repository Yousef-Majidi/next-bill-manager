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
				return <Zap className="text-primary h-4 w-4" />;
			case "water":
				return <Droplets className="text-primary h-4 w-4" />;
			case "gas":
				return <Flame className="text-primary h-4 w-4" />;
			default:
				return <Zap className="text-muted-foreground h-4 w-4" />;
		}
	};

	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent className="max-w-4xl">
				<DialogHeader>
					<div className="flex items-center gap-3">
						<div className="bg-primary/20 rounded-xl p-3">
							<Mail className="text-primary h-6 w-6" />
						</div>
						<div>
							<DialogTitle className="text-foreground text-xl font-semibold">
								Email Preview
							</DialogTitle>
							<DialogDescription className="text-muted-foreground">
								Review the email details before sending to {tenant.name}
							</DialogDescription>
						</div>
					</div>
				</DialogHeader>

				<div className="space-y-6">
					{/* Email Details */}
					<div className="bg-muted rounded-lg p-4">
						<div className="grid gap-3">
							<div className="flex items-center gap-2">
								<span className="text-muted-foreground text-sm font-medium">
									Subject:
								</span>
								<span className="text-foreground font-semibold">
									{emailContent.subject}
								</span>
							</div>
							<div className="flex items-center gap-2">
								<span className="text-muted-foreground text-sm font-medium">
									To:
								</span>
								<span className="text-foreground font-semibold">
									{tenant.email}
								</span>
							</div>
						</div>
					</div>

					{/* Bill Breakdown Table */}
					<div className="space-y-4">
						<h3 className="text-foreground text-lg font-semibold">
							Bill Breakdown
						</h3>
						<div className="overflow-hidden rounded-lg border">
							<Table>
								<TableHeader>
									<TableRow className="bg-muted">
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
														<Badge variant="outline">{percent}%</Badge>
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
						<div className="bg-muted rounded-lg p-4">
							<div className="space-y-3">
								<div className="flex items-center justify-between">
									<span className="text-muted-foreground font-medium">
										Your share for this month:
									</span>
									<span className="text-foreground text-lg font-bold">
										${tenantTotal.toFixed(2)}
									</span>
								</div>
								<div className="flex items-center justify-between">
									<span className="text-muted-foreground font-medium">
										{outstandingBalance < 0
											? "Credit balance:"
											: "Outstanding balance:"}
									</span>
									<span
										className={`text-lg font-bold ${outstandingBalance < 0 ? "text-primary" : "text-destructive"}`}>
										{outstandingBalance < 0
											? `-$${Math.abs(outstandingBalance).toFixed(2)}`
											: `$${outstandingBalance.toFixed(2)}`}
									</span>
								</div>
								<Separator />
								<div className="flex items-center justify-between">
									<span className="text-foreground font-semibold">
										Total Amount Due:
									</span>
									<span className="text-primary text-xl font-bold">
										${Math.max(0, finalAmountDue).toFixed(2)}
									</span>
								</div>
							</div>
						</div>
					</div>
				</div>

				<DialogFooter className="gap-3">
					<Button variant="outline" onClick={onClose}>
						Cancel
					</Button>
					<Button onClick={onConfirm}>
						<Send className="mr-2 h-4 w-4" />
						Send Email
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};
