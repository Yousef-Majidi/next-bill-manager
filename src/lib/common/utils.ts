import { z } from "zod";

import {
	ConsolidatedBill,
	Tenant,
	UtilityBill,
	UtilityProviderCategory,
} from "@/types";

// Zod schemas for validation
export const tenantFormSchema = z.object({
	name: z.string().min(1, "Name is required").trim(),
	email: z.string().email("Please enter a valid email address").trim(),
	secondaryName: z
		.string()
		.min(1, "Secondary name is required if provided")
		.optional()
		.or(z.literal("")),
	shares: z.object({
		[UtilityProviderCategory.Electricity]: z.number().min(0).max(100),
		[UtilityProviderCategory.Water]: z.number().min(0).max(100),
		[UtilityProviderCategory.Gas]: z.number().min(0).max(100),
	}),
});

export type TenantFormSchema = z.infer<typeof tenantFormSchema>;

// Utility function to round to 2 decimal places for currency
export const roundToCurrency = (amount: number): number => {
	return Math.round(amount * 100) / 100;
};

export const getTenantShares = (
	bill: ConsolidatedBill,
	tenant: Tenant,
): {
	shares: { [K in keyof typeof UtilityProviderCategory]: number };
	tenantTotal: number;
} => {
	const shares = {} as Record<keyof typeof UtilityProviderCategory, number>;
	for (const category in bill.categories) {
		const categoryKey = category as keyof typeof UtilityProviderCategory;
		const tenantSharePercentage = tenant?.shares[categoryKey] || 0;
		(shares as Record<string, number>)[categoryKey] = roundToCurrency(
			bill.categories[categoryKey].amount * (tenantSharePercentage / 100),
		);
	}
	const tenantTotal = roundToCurrency(
		Object.values(shares).reduce((sum, share) => sum + (share || 0), 0),
	);
	return { shares, tenantTotal };
};

export const getBillCategory = (
	bills: UtilityBill[],
): ConsolidatedBill["categories"] => {
	return bills.reduce(
		(acc, bill) => {
			const categoryKey = bill.utilityProvider
				.category as keyof typeof UtilityProviderCategory;
			return {
				...acc,
				[categoryKey]: acc[categoryKey]
					? {
							...acc[categoryKey],
							amount: roundToCurrency(acc[categoryKey].amount + bill.amount),
						}
					: {
							gmailMessageId: bill.gmailMessageId,
							amount: roundToCurrency(bill.amount),
							providerId: bill.utilityProvider.id,
							providerName: bill.utilityProvider.name,
						},
			};
		},
		{} as ConsolidatedBill["categories"],
	);
};

export const calculateTotalBillAmount = (bills: UtilityBill[]): number => {
	return roundToCurrency(bills.reduce((sum, bill) => sum + bill.amount, 0));
};

export const initializeConsolidatedBill = ({
	userId,
	bills,
	currentDate,
}: {
	userId: string;
	bills: UtilityBill[];
	currentDate: Date;
}): ConsolidatedBill | null => {
	const categories = getBillCategory(bills);
	const totalAmount = calculateTotalBillAmount(bills);

	if (totalAmount === 0) return null;

	return {
		id: null,
		userId,
		month: currentDate.getMonth() + 1,
		year: currentDate.getFullYear(),
		tenantId: null,
		categories,
		totalAmount,
		paid: false,
		dateSent: null,
		datePaid: null,
	};
};
