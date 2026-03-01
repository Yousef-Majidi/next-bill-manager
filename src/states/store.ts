import { atom } from "jotai";

import { ConsolidatedBill, Tenant, User, UtilityProvider } from "@/types";

// type-safe atoms
export const userAtom = atom<User | null>(null);
export const utilityProvidersAtom = atom<UtilityProvider[]>([]);
export const tenantsAtom = atom<Tenant[]>([]);
export const billsHistoryAtom = atom<ConsolidatedBill[]>([]);

// derived atoms for computed state
export const userIsAuthenticatedAtom = atom((get) => {
	const user = get(userAtom);
	return user !== null;
});

export const userEmailAtom = atom((get) => {
	const user = get(userAtom);
	return user?.email ?? null;
});

export const providersByCategoryAtom = atom((get) => {
	const providers = get(utilityProvidersAtom);
	const grouped = providers.reduce(
		(acc, provider) => {
			const category = provider.category;
			if (!acc[category]) {
				acc[category] = [];
			}
			acc[category]!.push(provider);
			return acc;
		},
		{} as Record<string, UtilityProvider[]>,
	);
	return grouped;
});

export const tenantsByEmailAtom = atom((get) => {
	const tenants = get(tenantsAtom);
	const grouped = tenants.reduce(
		(acc, tenant) => {
			acc[tenant.email] = tenant;
			return acc;
		},
		{} as Record<string, Tenant>,
	);
	return grouped;
});

export const billsByMonthAtom = atom((get) => {
	const bills = get(billsHistoryAtom);
	const grouped = bills.reduce(
		(acc, bill) => {
			const key = `${bill.year}-${bill.month.toString().padStart(2, "0")}`;
			if (!acc[key]) {
				acc[key] = [];
			}
			acc[key].push(bill);
			return acc;
		},
		{} as Record<string, ConsolidatedBill[]>,
	);
	return grouped;
});

export const totalOutstandingBalanceAtom = atom((get) => {
	const tenants = get(tenantsAtom);
	return tenants.reduce(
		(total, tenant) => total + tenant.outstandingBalance,
		0,
	);
});

export const totalBillsAmountAtom = atom((get) => {
	const bills = get(billsHistoryAtom);
	return bills.reduce((total, bill) => total + bill.totalAmount, 0);
});

export const paidBillsCountAtom = atom((get) => {
	const bills = get(billsHistoryAtom);
	return bills.filter((bill) => bill.paid).length;
});

export const unpaidBillsCountAtom = atom((get) => {
	const bills = get(billsHistoryAtom);
	return bills.filter((bill) => !bill.paid).length;
});
