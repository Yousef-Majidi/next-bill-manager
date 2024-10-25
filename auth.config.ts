import type { NextAuthConfig } from "next-auth";

export const authConfig = {
    pages: {
        signIn: "/login",
    },
    secret: process.env.GOOGLE_CLIENT_SECRET!,
    callbacks: {
        jwt: ({ token, account }) => {
            // console.log("account in jwt", account);
            if (account?.access_token) {
                // console.log("Account access token", account);
                token.accessToken = account.access_token;
                token.accessTokenExp = account.expires_at;
            }
            const now = Math.floor(Date.now() / 1000);

            if ((token?.accessTokenExp as number) <= now) {
                console.log("access token expired");
                return Promise.resolve(null);
            }

            // console.log(token);
            return token;
        },
        authorized({ auth, request: { nextUrl } }) {
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
} satisfies NextAuthConfig;
