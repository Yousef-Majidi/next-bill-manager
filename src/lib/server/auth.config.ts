import NextAuthConfig from "next-auth";
import { Account, Profile, Session, User } from "next-auth";
import { JWT } from "next-auth/jwt";

// extend the Session type to include our custom properties
declare module "next-auth" {
	interface Session {
		accessToken?: string | undefined;
		accessTokenExp?: number | undefined;
		providerAccountId?: string | undefined;
	}
}

// extend the JWT type to include our custom properties
declare module "next-auth/jwt" {
	interface JWT {
		accessToken?: string | undefined;
		accessTokenExp?: number | undefined;
		providerAccountId?: string | undefined;
	}
}

export const authConfig = {
	pages: {
		signIn: "/",
	},
	secret: process.env.GOOGLE_CLIENT_SECRET || "fallback-secret-for-build",
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
			if (account) {
				if (account.access_token) {
					token.accessToken = account.access_token;
					token.accessTokenExp = account.expires_at ?? undefined;
					token.providerAccountId = account.providerAccountId;
				}
				return token;
			}

			const now = Math.floor(Date.now() / 1000);
			if (token.accessTokenExp && (token.accessTokenExp as number) <= now) {
				// Optionally, you can remove the accessToken or handle as needed
				delete token.accessToken;
				delete token.accessTokenExp;
			}
			return token;
		},
		session: ({ session, token }: { session: Session; token: JWT }) => {
			if (token.accessToken) {
				session.accessToken = token.accessToken;
				session.accessTokenExp = token.accessTokenExp ?? undefined;
				session.providerAccountId = token.providerAccountId ?? undefined;
			}

			return session;
		},
	},
	providers: [],
};
export const auth = NextAuthConfig(authConfig);
