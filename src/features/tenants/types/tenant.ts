import { UtilityProviderCategory } from "@/types/utility-provider";

export interface Tenant {
	readonly id: string;
	readonly userId: string;
	readonly name: string;
	readonly email: string;
	readonly secondaryName?: string;
	readonly shares: {
		readonly [key in UtilityProviderCategory]: number;
	};
	readonly outstandingBalance: number;
}
