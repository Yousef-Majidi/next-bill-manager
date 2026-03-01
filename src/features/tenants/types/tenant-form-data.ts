import { UtilityProviderCategory } from "@/features/providers/types";

export interface TenantFormData {
	readonly name: string;
	readonly email: string;
	readonly secondaryName?: string;
	readonly shares: {
		readonly [key in UtilityProviderCategory]?: number;
	};
}
