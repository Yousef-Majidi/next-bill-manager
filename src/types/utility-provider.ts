export enum UtilityProviderCategory {
	Water = "Water",
	Gas = "Gas",
	Electricity = "Electricity",
}

export interface UtilityProvider {
	id?: string;
	userId: string;
	name: string;
	category: UtilityProviderCategory;
}
