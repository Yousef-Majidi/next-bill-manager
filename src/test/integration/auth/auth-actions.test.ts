import { signIn } from "next-auth/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { signInWithGoogle } from "@/features/auth/actions";
import {
	createAuthenticationError,
	createUnknownError,
	safeExecuteAsync,
} from "@/lib/common/error-handling";

// Mock NextAuth
vi.mock("next-auth/react", () => ({
	signIn: vi.fn(),
}));

// Mock error handling
vi.mock("@/lib/common/error-handling", () => ({
	safeExecuteAsync: vi.fn(),
	createAuthenticationError: vi.fn(),
	createUnknownError: vi.fn(),
}));

describe("Auth Actions", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe("signInWithGoogle", () => {
		it("should initiate Google sign-in successfully", async () => {
			vi.mocked(safeExecuteAsync).mockResolvedValue({
				success: true,
				data: "Sign-in initiated",
			});

			const result = await signInWithGoogle();

			expect(result.success).toBe(true);
			expect(result.data).toEqual({
				message: "Sign-in initiated successfully",
			});
			expect(safeExecuteAsync).toHaveBeenCalledWith(expect.any(Function));
		});

		it("should handle sign-in errors", async () => {
			vi.mocked(safeExecuteAsync).mockResolvedValue({
				success: false,
				error: createAuthenticationError(
					"Authentication failed",
					"INVALID_CREDENTIALS",
				),
			});

			const result = await signInWithGoogle();

			expect(result.success).toBe(false);
			expect(result.error).toBe("Failed to sign in with Google");
		});

		it("should handle unknown errors", async () => {
			vi.mocked(safeExecuteAsync).mockResolvedValue({
				success: false,
				error: createUnknownError("Unknown error occurred"),
			});

			const result = await signInWithGoogle();

			expect(result.success).toBe(false);
			expect(result.error).toBe("Failed to sign in with Google");
		});

		it("should call signIn with correct parameters", async () => {
			vi.mocked(safeExecuteAsync).mockImplementation(async (fn) => {
				await fn();
				return { success: true, data: "Success" };
			});

			await signInWithGoogle();

			expect(signIn).toHaveBeenCalledWith("google", {
				callbackUrl: "/dashboard",
			});
		});
	});
});
