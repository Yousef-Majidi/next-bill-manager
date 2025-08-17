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
