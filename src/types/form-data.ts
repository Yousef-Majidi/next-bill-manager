import { UtilityProviderCategory } from "@/types/utility-provider";

export interface UtilityProviderFormData {
	readonly name: string;
	readonly category: string;
}

export interface TenantFormData {
	readonly name: string;
	readonly email: string;
	readonly secondaryName?: string;
	readonly shares: {
		readonly [key in UtilityProviderCategory]?: number;
	};
}
