import NextAuth from "next-auth";

import { authConfig } from "@/lib/server/auth";

export default NextAuth(authConfig).auth;

export const config = {
	matcher: ["/((?!api|_next/static|_next/image|.*\\.png$).*)"],
};

export { auth as middleware } from "@/lib/server/auth";
