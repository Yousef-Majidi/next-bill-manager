import { ConsolidatedBill, Tenant, UtilityBill } from "@/types";
import { UtilityProviderCategory as UtilityCategory } from "@/types";

export const getTenantShares = (
	bill: ConsolidatedBill,
	tenant: Tenant,
): {
	shares: { [K in keyof typeof UtilityCategory]: number };
	tenantTotal: number;
} => {
	const shares = {} as Record<keyof typeof UtilityCategory, number>;
	for (const category in bill.categories) {
		const categoryKey = category as keyof typeof UtilityCategory;
		const tenantSharePercentage = tenant?.shares[categoryKey] || 0;
		(shares as Record<string, number>)[categoryKey] =
			bill.categories[categoryKey].amount * (tenantSharePercentage / 100);
	}
	const tenantTotal = Object.values(shares).reduce(
		(sum, share) => sum + (share || 0),
		0,
	);
	return { shares, tenantTotal };
};

export const getBillCategory = (
	bills: UtilityBill[],
): ConsolidatedBill["categories"] => {
	return bills.reduce(
		(acc, bill) => {
			const categoryKey = bill.utilityProvider
				.category as keyof typeof UtilityCategory;
			return {
				...acc,
				[categoryKey]: acc[categoryKey]
					? {
							...acc[categoryKey],
							amount: acc[categoryKey].amount + bill.amount,
						}
					: {
							gmailMessageId: bill.gmailMessageId,
							amount: bill.amount,
							providerId: bill.utilityProvider.id,
							providerName: bill.utilityProvider.name,
						},
			};
		},
		{} as ConsolidatedBill["categories"],
	);
};

export const calculateTotalBillAmount = (bills: UtilityBill[]): number => {
	return bills.reduce((sum, bill) => sum + bill.amount, 0);
};
