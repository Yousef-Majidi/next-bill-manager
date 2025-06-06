import { ConsolidatedBill, Tenant } from "@/types";
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
