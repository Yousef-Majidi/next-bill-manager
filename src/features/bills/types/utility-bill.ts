import {
	UtilityProviderCategory as UtilityCategory,
	UtilityProvider,
} from "@/features/providers/types";

export interface UtilityBill {
	readonly id: string | null;
	readonly gmailMessageId: string;
	readonly utilityProvider: UtilityProvider;
	readonly amount: number;
	readonly month: number;
	readonly year: number;
}

export interface ConsolidatedBill {
	readonly id: string | null;
	readonly userId: string;
	readonly month: number;
	readonly year: number;
	readonly tenantId: string | null;
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
	readonly dateSent: string | null;
	readonly datePaid: string | null;
}
