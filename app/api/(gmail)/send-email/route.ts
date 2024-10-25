import { google } from "googleapis";
import { getToken } from "next-auth/jwt";

export async function GET(req: Request) {
    try {
        const secret = process.env.GOOGLE_CLIENT_SECRET;
        const token = await getToken({ req, secret });
        console.log("token", token);
        const accessToken = token?.accessToken as string;
        const oauthClient = new google.auth.OAuth2(
            process.env.GOOGLE_CLIENT_ID,
            process.env.GOOGLE_CLIENT_SECRET,
            process.env.GOOGLE_REDIRECT_URI
        );
        oauthClient.setCredentials({
            access_token: accessToken,
        });

        const messageSubject = "Test Email";
        const bodyText = "This is a test email sent from a Next.js app.";
        const fromEmail = "y.majidin@gmail.com";
        const toEmail = "y.majidin@gmail.com";
        const mimeMessage = [
            `From: "Your Name" <${fromEmail}>`,
            `To: ${toEmail}`,
            `Subject: ${messageSubject}`,
            `Content-Type: text/plain; charset="UTF-8"`,
            "",
            bodyText,
        ].join("\n");

        const base64EncodedEmail = Buffer.from(mimeMessage)
            .toString("base64")
            .replace(/\+/g, "-")
            .replace(/\//g, "_")
            .replace(/=+$/, "");
        const gmail = google.gmail({ version: "v1", auth: oauthClient });
        gmail.users.messages.send({
            userId: "me",
            requestBody: {
                raw: base64EncodedEmail,
            },
        });
        console.log("email sent");
        return Response.json({ message: "email sent" });
    } catch (error) {
        console.error(error);
        return Response.json({ message: `Error in sending mail: ${error}` });
    }
}
