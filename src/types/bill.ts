import {
	Tenant,
	UtilityProviderCategory as UtilityCategory,
	UtilityProvider,
} from "@/types";

export interface UtilityBill {
	readonly id?: string;
	readonly gmailMessageId: string;
	readonly utilityProvider: UtilityProvider;
	readonly amount: number;
	readonly month: number;
	readonly year: number;
}

export interface ConsolidatedBill {
	id?: string;
	readonly userId: string;
	readonly month: number;
	readonly year: number;
	readonly categories: {
		readonly [K in keyof typeof UtilityCategory]: {
			readonly gmailMessageId: string;
			readonly amount: number;
			readonly provider: UtilityProvider;
		};
	};
	readonly totalAmount: number;
	readonly tenant: Tenant;
	readonly paid: boolean;
	readonly dateSent?: string; // ISO date string
}
