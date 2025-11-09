import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";

import { authConfig } from "@/lib/server/auth.config";

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
		CredentialsProvider({
			id: "credentials",
			name: "Demo Account",
			credentials: {
				email: { label: "Email", type: "text" },
			},
			async authorize(credentials) {
				if (!credentials?.email) {
					return null;
				}

				const demoUserId = process.env.DEMO_USER_ID;
				const demoUserEmail = process.env.DEMO_USER_EMAIL;
				const demoUserName = process.env.DEMO_USER_NAME;

				if (
					!demoUserId ||
					!demoUserEmail ||
					!demoUserName ||
					credentials.email !== demoUserEmail
				) {
					return null;
				}

				return {
					id: demoUserId,
					email: demoUserEmail,
					name: demoUserName,
				};
			},
		}),
	],
};

export default NextAuth(authOptions);
