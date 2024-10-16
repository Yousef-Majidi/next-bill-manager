import type { NextAuthConfig } from "next-auth";

export const authConfig = {
    pages: {
        signIn: "/login",
    },
    callbacks: {
        authorized({ auth, request: { nextUrl } }) {
            const isLoggedIn = !!auth?.user;
            const isOnDashboard = nextUrl.pathname.startsWith("/dashboard");

            if (isOnDashboard) {
                if (isLoggedIn) return true;
                return false; // redirects to login
            } else if (isLoggedIn) {
                console.log("user:", auth.user);
                return Response.redirect(new URL("/dashboard", nextUrl));
            }
            return true;
        },
    },
    providers: [],
} satisfies NextAuthConfig;
