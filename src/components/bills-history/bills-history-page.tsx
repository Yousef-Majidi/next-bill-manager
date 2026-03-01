"use client";

import { useState } from "react";

import { useAtom } from "jotai";
import {
	Calendar,
	CheckCircle,
	ChevronDown,
	ChevronUp,
	Clock,
	DollarSign,
	Droplets,
	Eye,
	FileText,
	Filter,
	Flame,
	X,
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
	Input,
	Label,
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
	Separator,
} from "@/components/ui";
import { isObjectType } from "@/lib/common/type-utils";
import { getTenantShares } from "@/lib/common/utils";
import { findById } from "@/lib/data";
import { billsHistoryAtom, tenantsAtom } from "@/states";

interface FilterState {
	tenants: string[];
	years: string[];
	months: string[];
	status: string;
	amountRange: string;
	providers: string[];
	dateRange: {
		start: string;
		end: string;
	};
}

export const BillsHistoryPage = () => {
	const [filterExpanded, setFilterExpanded] = useState(false);
	const [filters, setFilters] = useState<FilterState>({
		tenants: [],
		years: [],
		months: [],
		status: "all",
		amountRange: "all",
		providers: [],
		dateRange: { start: "", end: "" },
	});

	const [billsHistory] = useAtom(billsHistoryAtom);
	const [tenantsList] = useAtom(tenantsAtom);

	// Get unique values for filter options
	const uniqueYears = [...new Set(billsHistory.map((bill) => bill.year))].sort(
		(a, b) => b - a,
	);
	const uniqueMonths = [
		...new Set(billsHistory.map((bill) => bill.month)),
	].sort((a, b) => b - a);
	const uniqueTenants = tenantsList.filter((tenant) =>
		billsHistory.some((bill) => bill.tenantId === tenant.id),
	);

	// Filter bills based on all criteria
	const filteredBills = billsHistory.filter((bill) => {
		const tenant = findById(tenantsList, bill.tenantId!);
		if (!isObjectType(tenant)) return false;

		// Tenant filter
		if (
			filters.tenants.length > 0 &&
			!filters.tenants.includes(bill.tenantId!)
		) {
			return false;
		}

		// Year filter
		if (
			filters.years.length > 0 &&
			!filters.years.includes(bill.year.toString())
		) {
			return false;
		}

		// Month filter
		if (
			filters.months.length > 0 &&
			!filters.months.includes(bill.month.toString())
		) {
			return false;
		}

		// Status filter
		if (filters.status !== "all") {
			const isPaid = filters.status === "paid";
			if (bill.paid !== isPaid) return false;
		}

		// Amount range filter
		if (filters.amountRange !== "all") {
			const { tenantTotal } = getTenantShares(bill, tenant);
			switch (filters.amountRange) {
				case "0-100":
					if (tenantTotal > 100) return false;
					break;
				case "100-500":
					if (tenantTotal <= 100 || tenantTotal > 500) return false;
					break;
				case "500+":
					if (tenantTotal <= 500) return false;
					break;
			}
		}

		// Provider filter
		if (filters.providers.length > 0) {
			const hasMatchingProvider = filters.providers.some((provider) =>
				Object.values(bill.categories).some((cat) => {
					if (isObjectType(cat) && typeof cat.providerName === "string") {
						return cat.providerName === provider;
					}
					return false;
				}),
			);
			if (!hasMatchingProvider) return false;
		}

		// Date range filter
		if (filters.dateRange.start && bill.dateSent) {
			const sentDate = new Date(bill.dateSent);
			const startDate = new Date(filters.dateRange.start);
			if (sentDate < startDate) return false;
		}

		if (filters.dateRange.end && bill.dateSent) {
			const sentDate = new Date(bill.dateSent);
			const endDate = new Date(filters.dateRange.end);
			if (sentDate > endDate) return false;
		}

		return true;
	});

	// Get unique providers from bills
	const uniqueProviders = [
		...new Set(
			billsHistory.flatMap((bill) =>
				Object.values(bill.categories)
					.filter(
						(cat) => isObjectType(cat) && typeof cat.providerName === "string",
					)
					.map((cat) => (cat as { providerName: string }).providerName),
			),
		),
	].sort();

	// Update filter function
	const updateFilter = <K extends keyof FilterState>(
		key: K,
		value: FilterState[K],
	) => {
		setFilters((prev) => ({ ...prev, [key]: value }));
	};

	// Clear all filters
	const clearAllFilters = () => {
		setFilters({
			tenants: [],
			years: [],
			months: [],
			status: "all",
			amountRange: "all",
			providers: [],
			dateRange: { start: "", end: "" },
		});
	};

	// Get active filter count
	const activeFilterCount = [
		filters.tenants.length,
		filters.years.length,
		filters.months.length,
		filters.status !== "all" ? 1 : 0,
		filters.amountRange !== "all" ? 1 : 0,
		filters.providers.length,
		filters.dateRange.start || filters.dateRange.end ? 1 : 0,
	].reduce((sum, count) => sum + count, 0);

	return (
		<div className="space-y-8">
			{/* Page Header */}
			<div className="space-y-1">
				<h1 className="text-3xl font-bold tracking-tight text-gray-900">
					Bills History
				</h1>
				<p className="text-gray-600">
					View and track all consolidated utility bills sent to tenants
				</p>
			</div>

			{/* Summary Stats */}
			<div className="grid gap-6 md:grid-cols-3">
				<Card className="border-0 bg-gradient-to-br from-blue-50 to-indigo-50 shadow-sm">
					<CardContent className="p-6">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm font-medium text-blue-600">
									Total Bills Sent
								</p>
								<p className="text-3xl font-bold text-gray-900">
									{billsHistory.length}
								</p>
							</div>
							<div className="rounded-full bg-blue-100 p-3">
								<FileText className="h-6 w-6 text-blue-600" />
							</div>
						</div>
					</CardContent>
				</Card>

				<Card className="border-0 bg-gradient-to-br from-green-50 to-emerald-50 shadow-sm">
					<CardContent className="p-6">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm font-medium text-green-600">
									Total Amount Billed
								</p>
								<p className="text-3xl font-bold text-gray-900">
									$
									{billsHistory
										.reduce((sum, bill) => {
											const tenant = findById(tenantsList, bill.tenantId!);
											if (!isObjectType(tenant)) return sum;
											const tenantShares = getTenantShares(bill, tenant);
											return sum + (tenantShares?.tenantTotal || 0);
										}, 0)
										.toFixed(2)}
								</p>
							</div>
							<div className="rounded-full bg-green-100 p-3">
								<DollarSign className="h-6 w-6 text-green-600" />
							</div>
						</div>
					</CardContent>
				</Card>

				<Card className="border-0 bg-gradient-to-br from-purple-50 to-violet-50 shadow-sm">
					<CardContent className="p-6">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm font-medium text-purple-600">
									Collection Rate
								</p>
								<p className="text-3xl font-bold text-gray-900">
									{Math.round(
										(billsHistory.filter((b) => b.paid).length /
											billsHistory.length) *
											100,
									)}
									%
								</p>
							</div>
							<div className="rounded-full bg-purple-100 p-3">
								<CheckCircle className="h-6 w-6 text-purple-600" />
							</div>
						</div>
					</CardContent>
				</Card>
			</div>

			{/* Results Summary with Compact Filters */}
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-4">
					<p className="font-medium text-gray-600">
						Showing {filteredBills.length} of {billsHistory.length} bills
					</p>

					{/* Compact Filter Controls */}
					<div className="flex items-center gap-2">
						<Button
							variant="outline"
							size="sm"
							onClick={() => setFilterExpanded(!filterExpanded)}
							className="flex items-center gap-2 border-gray-200 hover:bg-gray-50">
							<Filter className="h-4 w-4" />
							Filters
							{activeFilterCount > 0 && (
								<Badge
									variant="secondary"
									className="ml-1 bg-blue-100 text-xs text-blue-700">
									{activeFilterCount}
								</Badge>
							)}
							{filterExpanded ? (
								<ChevronUp className="h-4 w-4" />
							) : (
								<ChevronDown className="h-4 w-4" />
							)}
						</Button>
						{activeFilterCount > 0 && (
							<Button
								variant="ghost"
								size="sm"
								onClick={clearAllFilters}
								className="text-muted-foreground hover:text-foreground text-xs">
								Clear all
							</Button>
						)}
					</div>
				</div>
			</div>

			{/* Active Filter Badges */}
			{activeFilterCount > 0 && (
				<div className="flex flex-wrap gap-2">
					{filters.tenants.map((tenantId) => {
						const tenant = findById(tenantsList, tenantId);
						return tenant ? (
							<Badge
								key={tenantId}
								variant="secondary"
								className="flex items-center gap-1">
								Tenant: {tenant.name}
								<X
									className="h-3 w-3 cursor-pointer"
									onClick={() =>
										updateFilter(
											"tenants",
											filters.tenants.filter((id) => id !== tenantId),
										)
									}
								/>
							</Badge>
						) : null;
					})}
					{filters.years.map((year) => (
						<Badge
							key={year}
							variant="secondary"
							className="flex items-center gap-1">
							Year: {year}
							<X
								className="h-3 w-3 cursor-pointer"
								onClick={() =>
									updateFilter(
										"years",
										filters.years.filter((y) => y !== year),
									)
								}
							/>
						</Badge>
					))}
					{filters.months.map((month) => (
						<Badge
							key={month}
							variant="secondary"
							className="flex items-center gap-1">
							Month: {month}
							<X
								className="h-3 w-3 cursor-pointer"
								onClick={() =>
									updateFilter(
										"months",
										filters.months.filter((m) => m !== month),
									)
								}
							/>
						</Badge>
					))}
					{filters.status !== "all" && (
						<Badge variant="secondary" className="flex items-center gap-1">
							Status: {filters.status}
							<X
								className="h-3 w-3 cursor-pointer"
								onClick={() => updateFilter("status", "all")}
							/>
						</Badge>
					)}
					{filters.amountRange !== "all" && (
						<Badge variant="secondary" className="flex items-center gap-1">
							Amount: {filters.amountRange}
							<X
								className="h-3 w-3 cursor-pointer"
								onClick={() => updateFilter("amountRange", "all")}
							/>
						</Badge>
					)}
					{filters.providers.map((provider) => (
						<Badge
							key={provider}
							variant="secondary"
							className="flex items-center gap-1">
							Provider: {provider}
							<X
								className="h-3 w-3 cursor-pointer"
								onClick={() =>
									updateFilter(
										"providers",
										filters.providers.filter((p) => p !== provider),
									)
								}
							/>
						</Badge>
					))}
					{(filters.dateRange.start || filters.dateRange.end) && (
						<Badge variant="secondary" className="flex items-center gap-1">
							Date Range: {filters.dateRange.start || "Start"} -{" "}
							{filters.dateRange.end || "End"}
							<X
								className="h-3 w-3 cursor-pointer"
								onClick={() =>
									updateFilter("dateRange", { start: "", end: "" })
								}
							/>
						</Badge>
					)}
				</div>
			)}

			{/* Filter Controls */}
			{filterExpanded && (
				<Card>
					<CardContent className="p-4">
						<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
							{/* Tenant Filter */}
							<div className="space-y-2">
								<Label>Tenants</Label>
								<Select
									value=""
									onValueChange={(value) => {
										if (value && !filters.tenants.includes(value)) {
											updateFilter("tenants", [...filters.tenants, value]);
										}
									}}>
									<SelectTrigger>
										<SelectValue placeholder="Select tenants" />
									</SelectTrigger>
									<SelectContent>
										{uniqueTenants.map((tenant) => (
											<SelectItem key={tenant.id} value={tenant.id}>
												{tenant.name}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>

							{/* Year Filter */}
							<div className="space-y-2">
								<Label>Years</Label>
								<Select
									value=""
									onValueChange={(value) => {
										if (value && !filters.years.includes(value)) {
											updateFilter("years", [...filters.years, value]);
										}
									}}>
									<SelectTrigger>
										<SelectValue placeholder="Select years" />
									</SelectTrigger>
									<SelectContent>
										{uniqueYears.map((year) => (
											<SelectItem key={year} value={year.toString()}>
												{year}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>

							{/* Month Filter */}
							<div className="space-y-2">
								<Label>Months</Label>
								<Select
									value=""
									onValueChange={(value) => {
										if (value && !filters.months.includes(value)) {
											updateFilter("months", [...filters.months, value]);
										}
									}}>
									<SelectTrigger>
										<SelectValue placeholder="Select months" />
									</SelectTrigger>
									<SelectContent>
										{uniqueMonths.map((month) => (
											<SelectItem key={month} value={month.toString()}>
												{month}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>

							{/* Status Filter */}
							<div className="space-y-2">
								<Label>Status</Label>
								<Select
									value={filters.status}
									onValueChange={(value) => updateFilter("status", value)}>
									<SelectTrigger>
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="all">All Status</SelectItem>
										<SelectItem value="paid">Paid</SelectItem>
										<SelectItem value="unpaid">Unpaid</SelectItem>
									</SelectContent>
								</Select>
							</div>

							{/* Amount Range Filter */}
							<div className="space-y-2">
								<Label>Amount Range</Label>
								<Select
									value={filters.amountRange}
									onValueChange={(value) => updateFilter("amountRange", value)}>
									<SelectTrigger>
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="all">All Amounts</SelectItem>
										<SelectItem value="0-100">$0 - $100</SelectItem>
										<SelectItem value="100-500">$100 - $500</SelectItem>
										<SelectItem value="500+">$500+</SelectItem>
									</SelectContent>
								</Select>
							</div>

							{/* Provider Filter */}
							<div className="space-y-2">
								<Label>Providers</Label>
								<Select
									value=""
									onValueChange={(value) => {
										if (value && !filters.providers.includes(value)) {
											updateFilter("providers", [...filters.providers, value]);
										}
									}}>
									<SelectTrigger>
										<SelectValue placeholder="Select providers" />
									</SelectTrigger>
									<SelectContent>
										{uniqueProviders.map((provider) => (
											<SelectItem key={provider} value={provider}>
												{provider}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>

							{/* Date Range Filters */}
							<div className="space-y-2">
								<Label>Date Sent From</Label>
								<Input
									type="date"
									value={filters.dateRange.start}
									onChange={(e) =>
										updateFilter("dateRange", {
											...filters.dateRange,
											start: e.target.value,
										})
									}
								/>
							</div>

							<div className="space-y-2">
								<Label>Date Sent To</Label>
								<Input
									type="date"
									value={filters.dateRange.end}
									onChange={(e) =>
										updateFilter("dateRange", {
											...filters.dateRange,
											end: e.target.value,
										})
									}
								/>
							</div>
						</div>
					</CardContent>
				</Card>
			)}

			{/* Bills List */}
			<div className="space-y-4">
				{filteredBills.map((bill) => {
					const tenant = findById(tenantsList, bill.tenantId!);
					if (!isObjectType(tenant)) return null;
					const { tenantTotal, shares } = getTenantShares(bill, tenant);
					return (
						<Card
							key={bill.id}
							className="border-0 shadow-sm transition-shadow duration-200 hover:shadow-md">
							<CardContent className="p-6">
								<div className="flex items-center justify-between">
									<div className="flex items-center gap-4">
										<div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-blue-100 to-indigo-100">
											<FileText className="h-7 w-7 text-blue-600" />
										</div>

										<div className="space-y-2">
											<div className="flex items-center gap-3">
												<h3 className="text-lg font-semibold text-gray-900">
													{new Date(bill.year, bill.month, 0).toLocaleString(
														"default",
														{
															month: "long",
															year: "numeric",
														},
													)}
												</h3>
												<Badge
													variant="outline"
													className="border-gray-200 bg-gray-50 text-gray-700">
													{tenant.name}
												</Badge>
											</div>
											<div className="flex items-center gap-6 text-sm text-gray-600">
												<div className="flex items-center gap-2">
													<DollarSign className="h-4 w-4 text-green-600" />
													<span className="font-medium">
														Total Bill: ${bill.totalAmount}
													</span>
												</div>
												<div className="flex items-center gap-2">
													<DollarSign className="h-4 w-4 text-blue-600" />
													<span className="font-medium">
														Tenant Share: ${tenantTotal}
													</span>
												</div>
												<div className="flex items-center gap-2">
													<Calendar className="h-4 w-4 text-gray-500" />
													<span>
														Sent:{" "}
														{bill.dateSent
															? new Date(bill.dateSent).toLocaleDateString()
															: "N/A"}
													</span>
												</div>
												{bill.datePaid && (
													<div className="flex items-center gap-2">
														<CheckCircle className="h-4 w-4 text-green-600" />
														<span className="font-medium text-green-600">
															Paid:{" "}
															{new Date(bill.datePaid).toLocaleDateString()}
														</span>
													</div>
												)}
											</div>
										</div>
									</div>

									<div className="flex items-center gap-4">
										<div className="text-right">
											<p className="text-2xl font-bold text-gray-900">
												${tenantTotal}
											</p>
											<p className="text-sm text-gray-500">
												{((tenantTotal / bill.totalAmount) * 100).toFixed(0)}%
												of total
											</p>
										</div>

										<div className="flex gap-2">
											<Dialog>
												<DialogTrigger asChild>
													<Button
														variant="outline"
														size="sm"
														onClick={() => {
															toast.warning("bill details ");
														}}
														className="border-gray-200 hover:bg-gray-50">
														<Eye className="mr-2 h-4 w-4" />
														View Details
													</Button>
												</DialogTrigger>
												<DialogContent className="max-w-7xl">
													<DialogHeader className="space-y-3">
														<div className="flex items-center gap-3">
															<div className="rounded-xl bg-gradient-to-br from-blue-100 to-indigo-100 p-3">
																<FileText className="h-6 w-6 text-blue-600" />
															</div>
															<div>
																<DialogTitle className="text-xl font-semibold text-gray-900">
																	Bill Details -{" "}
																	{new Date(
																		bill.year,
																		bill.month,
																		0,
																	).toLocaleString("default", {
																		month: "long",
																		year: "numeric",
																	})}
																</DialogTitle>
																<DialogDescription className="text-gray-600">
																	Consolidated bill sent to {tenant.email}
																</DialogDescription>
															</div>
														</div>
													</DialogHeader>

													<div className="space-y-6">
														<div className="grid gap-6 md:grid-cols-3">
															<Card className="border-0 bg-gradient-to-br from-yellow-50 to-orange-50 shadow-sm">
																<CardContent className="p-6">
																	<div className="mb-4 flex items-center justify-center">
																		<div className="rounded-xl bg-yellow-100 p-3">
																			<Zap className="h-6 w-6 text-yellow-600" />
																		</div>
																	</div>
																	<div className="mb-4 flex min-h-[3rem] flex-col justify-center">
																		<p className="text-2xl leading-tight font-bold text-gray-900">
																			${bill.categories.Electricity.amount}
																		</p>
																		<p className="mt-1 text-sm font-medium text-gray-600">
																			{bill.categories.Electricity.providerName}
																		</p>
																	</div>
																	<div className="space-y-1">
																		<p className="font-semibold text-gray-900">
																			Tenant Share: ${shares.Electricity} (
																			{(
																				(shares.Electricity /
																					bill.categories.Electricity.amount) *
																				100
																			).toFixed(1)}
																			%)
																		</p>
																	</div>
																</CardContent>
															</Card>

															<Card className="border-0 bg-gradient-to-br from-blue-50 to-cyan-50 shadow-sm">
																<CardContent className="p-6">
																	<div className="mb-4 flex items-center justify-center">
																		<div className="rounded-xl bg-blue-100 p-3">
																			<Droplets className="h-6 w-6 text-blue-600" />
																		</div>
																	</div>
																	<div className="mb-4 flex min-h-[3rem] flex-col justify-center">
																		<p className="text-2xl leading-tight font-bold text-gray-900">
																			${bill.categories.Water.amount}
																		</p>
																		<p className="mt-1 text-sm font-medium text-gray-600">
																			{bill.categories.Water.providerName}
																		</p>
																	</div>
																	<div className="space-y-1">
																		<p className="font-semibold text-gray-900">
																			Tenant Share: ${shares.Water} (
																			{bill.categories.Water.amount > 0
																				? (
																						(shares.Water /
																							bill.categories.Water.amount) *
																						100
																					).toFixed(1)
																				: 0}
																			%)
																		</p>
																	</div>
																</CardContent>
															</Card>

															<Card className="border-0 bg-gradient-to-br from-orange-50 to-red-50 shadow-sm">
																<CardContent className="p-6">
																	<div className="mb-4 flex items-center justify-center">
																		<div className="rounded-xl bg-orange-100 p-3">
																			<Flame className="h-6 w-6 text-orange-600" />
																		</div>
																	</div>
																	<div className="mb-4 flex min-h-[3rem] flex-col justify-center">
																		<p className="text-2xl leading-tight font-bold text-gray-900">
																			${bill.categories.Gas.amount}
																		</p>
																		<p className="mt-1 text-sm font-medium text-gray-600">
																			{bill.categories.Gas.providerName}
																		</p>
																	</div>
																	<div className="space-y-1">
																		<p className="font-semibold text-gray-900">
																			Tenant Share: ${shares.Gas} (
																			{(
																				(shares.Gas /
																					bill.categories.Gas.amount) *
																				100
																			).toFixed(1)}
																			%)
																		</p>
																	</div>
																</CardContent>
															</Card>
														</div>

														<Separator className="my-6" />

														<Card className="border-0 bg-gradient-to-r from-gray-50 to-gray-100 shadow-sm">
															<CardContent className="p-6">
																<div className="flex items-center justify-between">
																	<div>
																		<p className="mb-1 text-sm font-medium text-gray-600">
																			Total Amount Due
																		</p>
																		<p className="text-3xl font-bold text-gray-900">
																			${tenantTotal}
																		</p>
																	</div>
																	<div className="text-right">
																		<p className="mb-2 text-sm font-medium text-gray-600">
																			Bill Status
																		</p>
																		<Badge
																			variant={
																				bill.paid ? "default" : "destructive"
																			}
																			className={`px-3 py-1 text-sm ${
																				bill.paid
																					? "border-green-200 bg-green-100 text-green-700"
																					: "border-red-200 bg-red-100 text-red-700"
																			}`}>
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
													</div>
												</DialogContent>
											</Dialog>

											<Badge
												variant={bill.paid ? "default" : "destructive"}
												className={
													bill.paid
														? "border-green-200 bg-green-100 text-green-700"
														: "border-red-200 bg-red-100 text-red-700"
												}>
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
							</CardContent>
						</Card>
					);
				})}
			</div>

			{filteredBills.length === 0 && (
				<Card className="border-0 shadow-sm">
					<CardContent className="flex flex-col items-center justify-center py-16">
						<div className="mb-6 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 p-6">
							<FileText className="h-12 w-12 text-gray-500" />
						</div>
						<h3 className="mb-2 text-xl font-semibold text-gray-900">
							No bills found
						</h3>
						<p className="max-w-md text-center text-gray-600">
							No bills match your current filter criteria. Try adjusting your
							filters to see more results.
						</p>
					</CardContent>
				</Card>
			)}
		</div>
	);
};
