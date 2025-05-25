export interface User {
	id: string;
	name: string;
	email: string;
	accessToken?: string;
	accessTokenExp?: number;
}
