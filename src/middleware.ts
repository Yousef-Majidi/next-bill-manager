import { NextRequest, NextResponse } from "next/server";

import { getToken } from "next-auth/jwt";

export async function middleware(request: NextRequest) {
	const secret =
		process.env.GOOGLE_CLIENT_SECRET || "fallback-secret-for-build";

	const token = await getToken({
		req: request,
		secret,
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
