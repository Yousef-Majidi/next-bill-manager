/* eslint-disable @typescript-eslint/no-explicit-any */
import NextAuthConfig from "next-auth";
import { Account, Profile, Session, User } from "next-auth";
import { JWT } from "next-auth/jwt";

export const authConfig = {
	pages: {
		signIn: "/",
	},
	secret: process.env.GOOGLE_CLIENT_SECRET!,
	callbacks: {
		jwt: ({
			token,
			account,
		}: {
			token: JWT;
			account?: Account | null;
			user?: User | null;
			profile?: Profile | null;
			trigger?: "signIn" | "signUp" | "update";
			isNewUser?: boolean;
			session?: Session;
		}) => {
			if (!account) return token;
			if (account.access_token) {
				token.accessToken = account.access_token;
				token.accessTokenExp = account.expires_at;
				token.providerAccountId = account.providerAccountId;
			}

			const now = Math.floor(Date.now() / 1000);
			if (token.accessTokenExp && (token.accessTokenExp as number) <= now) {
				// Optionally, you can remove the accessToken or handle as needed
				delete token.accessToken;
				delete token.accessTokenExp;
			}
			return token;
		},
		session: ({ session, token }: { session: any; token: JWT }) => {
			if (token.accessToken) {
				session.accessToken = token.accessToken;
				session.accessTokenExp = token.accessTokenExp;
				session.providerAccountId = token.providerAccountId;
			}

			return session;
		},
		authorized({
			auth,
			request: { nextUrl },
		}: {
			auth: any;
			request: { nextUrl: any };
		}): boolean | Response {
			const isLoggedIn = !!auth?.user;
			const isOnDashboard = nextUrl.pathname.startsWith("/dashboard");
			if (isOnDashboard) {
				if (isLoggedIn) return true;
				return false; // redirects to login
			} else if (isLoggedIn) {
				return Response.redirect(new URL("/dashboard", nextUrl));
			}
			return true;
		},
	},
	providers: [],
};
export const auth = NextAuthConfig(authConfig);
