import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";

import { authConfig } from "@/lib/server/auth/auth.config";

export const authOptions = {
	...authConfig,
	providers: [
		GoogleProvider({
			clientId: process.env.GOOGLE_CLIENT_ID!,
			clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
			authorization: {
				params: {
					scope:
						"https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/gmail.send https://www.googleapis.com/auth/gmail.readonly",
				},
			},
		}),
	],
};

export default NextAuth(authOptions);
