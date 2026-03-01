import { gmail_v1, google } from "googleapis";

export const getGmailClient = (accessToken: string): gmail_v1.Gmail => {
	if (typeof window !== "undefined") {
		throw new Error("getGmailClient can only be used on the server side.");
	}
	const auth = new google.auth.OAuth2();
	auth.setCredentials({
		access_token: accessToken,
	});
	return google.gmail({ version: "v1", auth });
};
