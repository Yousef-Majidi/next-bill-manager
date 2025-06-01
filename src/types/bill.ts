import {
	Tenant,
	UtilityProviderCategory as UtilityCategory,
	UtilityProvider,
} from "@/types";

export interface UtilityBill {
	readonly id?: string;
	readonly utilityProvider: UtilityProvider;
	readonly amount: number;
	readonly month: number;
	readonly year: number;
}

export class ConsolidatedBill {
	id?: string;
	readonly month: number;
	readonly year: number;
	readonly tenant: Tenant;
	readonly totalAmount: number;
	readonly paid: boolean;
	readonly dateSent?: string;

	readonly categories: {
		readonly [K in keyof typeof UtilityCategory]: {
			readonly amount: number;
			readonly provider: UtilityProvider;
		};
	};

	constructor(
		id: string | undefined,
		month: number,
		year: number,
		tenant: Tenant,
		categories: {
			readonly [K in keyof typeof UtilityCategory]: {
				readonly amount: number;
				readonly provider: UtilityProvider;
			};
		},
		totalAmount: number,
		paid: boolean,
		dateSent?: string,
	) {
		this.id = id;
		this.month = month;
		this.year = year;
		this.tenant = tenant;
		this.categories = categories;
		this.totalAmount = totalAmount;
		this.paid = paid;
		this.dateSent = dateSent;
	}

	/**
	 * Setter for the ID property.
	 */
	setId(newId: string): void {
		this.id = newId;
	}

	/**
	 * Derives tenant shares dynamically based on categories and tenant's share percentages.
	 */
	get tenantShares(): { [K in keyof typeof UtilityCategory]?: number } {
		const shares = {} as {
			-readonly [K in keyof typeof UtilityCategory]?: number;
		};
		for (const category in this.categories) {
			const categoryKey = category as keyof typeof UtilityCategory;
			const tenantSharePercentage = this.tenant.shares[categoryKey] || 0;
			shares[categoryKey] =
				this.categories[categoryKey].amount * (tenantSharePercentage / 100);
		}
		return shares;
	}

	/**
	 * Calculates the tenant's total share dynamically based on tenantShares.
	 */
	get tenantTotalShare(): number {
		return Object.values(this.tenantShares).reduce(
			(sum, share) => sum + (share || 0),
			0,
		);
	}
}
