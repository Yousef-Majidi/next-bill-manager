import { signIn } from "next-auth/react";

import { safeExecuteAsync } from "@/lib/common/error-handling";

export async function signInWithGoogle() {
	const result = await safeExecuteAsync(async () => {
		await signIn("google", { callbackUrl: "/dashboard" });
	});

	if (!result.success) {
		return {
			success: false,
			error: result.error || "Failed to sign in with Google",
		};
	}

	return {
		success: true,
		data: { message: "Sign-in initiated successfully" },
	};
}

export async function signInAsDemo() {
	// Use NEXT_PUBLIC_DEMO_USER_EMAIL if available, otherwise fallback to default
	// The actual validation happens server-side in the Credentials provider
	const demoUserEmail =
		process.env.NEXT_PUBLIC_DEMO_USER_EMAIL || "demo@example.com";

	try {
		// signIn doesn't throw errors, it redirects or returns undefined
		// We need to call it directly without the safeExecuteAsync wrapper
		// because it handles redirects internally
		await signIn("credentials", {
			email: demoUserEmail,
			callbackUrl: "/dashboard",
			redirect: true,
		});

		return {
			success: true,
			data: { message: "Demo sign-in initiated successfully" },
		};
	} catch (error) {
		return {
			success: false,
			error:
				error instanceof Error
					? error.message
					: "Failed to sign in as demo user. Please ensure DEMO_USER_EMAIL, DEMO_USER_ID, and DEMO_USER_NAME are set in your environment variables.",
		};
	}
}
