export enum UtilityProviderCategory {
	Water = "Water",
	Gas = "Gas",
	Electricity = "Electricity",
}

export interface UtilityProvider {
	readonly id: string | null;
	readonly userId: string;
	readonly name: string;
	readonly category: UtilityProviderCategory;
	readonly email?: string;
	readonly website?: string;
}
