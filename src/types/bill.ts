import {
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
	readonly tenantId: string;
	readonly categories: {
		readonly [K in keyof typeof UtilityCategory]: {
			readonly gmailMessageId: string;
			readonly providerId: string;
			readonly providerName: string;
			readonly amount: number;
		};
	};
	readonly totalAmount: number;
	readonly paid: boolean;
	readonly dateSent?: string;
}
