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

export interface UtilityBill {
	id?: string;
	utilityProvider: UtilityProvider;
	amount: number;
	month: number;
	year: number;
	sent: boolean;
	sentTo?: string | null;
}
