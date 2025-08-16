export interface User {
	readonly id: string;
	readonly name: string;
	readonly email: string;
	readonly accessToken: string;
	readonly accessTokenExp: number;
}
