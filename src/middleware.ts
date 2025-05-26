import { NextRequest, NextResponse } from "next/server";

import { getToken } from "next-auth/jwt";

export async function middleware(request: NextRequest) {
	console.log("Middleware is running");

	const token = await getToken({
		req: request,
		secret: process.env.GOOGLE_CLIENT_SECRET,
	});
	const { pathname } = new URL(request.url);

	if (token || pathname === "/") {
		return NextResponse.next();
	}

	if (pathname.startsWith("/dashboard")) {
		return NextResponse.redirect(new URL("/", request.url));
	}

	return NextResponse.next();
}

export const config = {
	matcher: ["/((?!api|_next/static|_next/image|.*\\.png$).*)"],
};
