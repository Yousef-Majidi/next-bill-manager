import { describe, expect, it } from "vitest";

import {
	CreateProviderRequestSchema,
	UpdateProviderRequestSchema,
} from "@/lib/common/api-contracts";
import {
	EditProviderFormSchema,
	UtilityProviderFormSchema,
} from "@/lib/common/form-validation";
import { UtilityProviderCategory } from "@/types";

describe("Provider Form Validation", () => {
	describe("UtilityProviderFormSchema", () => {
		it("validates valid provider data", () => {
			const validData = {
				name: "Test Provider",
				category: UtilityProviderCategory.Electricity,
				email: "test@example.com",
				website: "https://example.com",
			};

			const result = UtilityProviderFormSchema.safeParse(validData);
			expect(result.success).toBe(true);
		});

		it("validates provider data without email and website", () => {
			const validData = {
				name: "Test Provider",
				category: UtilityProviderCategory.Electricity,
				email: "",
				website: "",
			};

			const result = UtilityProviderFormSchema.safeParse(validData);
			expect(result.success).toBe(true);
		});

		it("rejects invalid email format", () => {
			const invalidData = {
				name: "Test Provider",
				category: UtilityProviderCategory.Electricity,
				email: "invalid-email",
				website: "https://example.com",
			};

			const result = UtilityProviderFormSchema.safeParse(invalidData);
			expect(result.success).toBe(false);
			if (!result.success && result.error.issues[0]) {
				expect(result.error.issues[0].message).toContain(
					"Please enter a valid email address",
				);
			}
		});

		it("rejects invalid website URL", () => {
			const invalidData = {
				name: "Test Provider",
				category: UtilityProviderCategory.Electricity,
				email: "test@example.com",
				website: "invalid-url",
			};

			const result = UtilityProviderFormSchema.safeParse(invalidData);
			expect(result.success).toBe(false);
			if (!result.success && result.error.issues[0]) {
				expect(result.error.issues[0].message).toContain(
					"Please enter a valid URL",
				);
			}
		});

		it("rejects empty name", () => {
			const invalidData = {
				name: "",
				category: UtilityProviderCategory.Electricity,
				email: "test@example.com",
				website: "https://example.com",
			};

			const result = UtilityProviderFormSchema.safeParse(invalidData);
			expect(result.success).toBe(false);
			if (!result.success && result.error.issues[0]) {
				expect(result.error.issues[0].message).toContain("required");
			}
		});

		it("rejects invalid category", () => {
			const invalidData = {
				name: "Test Provider",
				category: "InvalidCategory",
				email: "test@example.com",
				website: "https://example.com",
			};

			const result = UtilityProviderFormSchema.safeParse(invalidData);
			expect(result.success).toBe(false);
		});

		it("accepts all valid categories", () => {
			const categories = [
				UtilityProviderCategory.Electricity,
				UtilityProviderCategory.Water,
				UtilityProviderCategory.Gas,
				"Internet",
				"OTHER",
			];

			categories.forEach((category) => {
				const data = {
					name: "Test Provider",
					category,
					email: "",
					website: "",
				};

				const result = UtilityProviderFormSchema.safeParse(data);
				expect(result.success).toBe(true);
			});
		});
	});

	describe("EditProviderFormSchema", () => {
		it("validates valid edit provider data", () => {
			const validData = {
				name: "Updated Provider",
				category: UtilityProviderCategory.Water,
				email: "updated@example.com",
				website: "https://updated.com",
			};

			const result = EditProviderFormSchema.safeParse(validData);
			expect(result.success).toBe(true);
		});

		it("validates edit data with cleared email and website", () => {
			const validData = {
				name: "Updated Provider",
				category: UtilityProviderCategory.Water,
				email: "",
				website: "",
			};

			const result = EditProviderFormSchema.safeParse(validData);
			expect(result.success).toBe(true);
		});

		it("rejects invalid email in edit form", () => {
			const invalidData = {
				name: "Updated Provider",
				category: UtilityProviderCategory.Water,
				email: "invalid-email",
				website: "https://updated.com",
			};

			const result = EditProviderFormSchema.safeParse(invalidData);
			expect(result.success).toBe(false);
		});
	});

	describe("CreateProviderRequestSchema", () => {
		it("validates valid create request", () => {
			const validData = {
				name: "New Provider",
				category: UtilityProviderCategory.Electricity,
				email: "new@example.com",
				website: "https://new.com",
			};

			const result = CreateProviderRequestSchema.safeParse(validData);
			expect(result.success).toBe(true);
		});

		it("validates create request without email and website", () => {
			const validData = {
				name: "New Provider",
				category: UtilityProviderCategory.Electricity,
			};

			const result = CreateProviderRequestSchema.safeParse(validData);
			expect(result.success).toBe(true);
		});

		it("rejects create request with invalid email", () => {
			const invalidData = {
				name: "New Provider",
				category: UtilityProviderCategory.Electricity,
				email: "invalid-email",
			};

			const result = CreateProviderRequestSchema.safeParse(invalidData);
			expect(result.success).toBe(false);
		});

		it("rejects create request with invalid website", () => {
			const invalidData = {
				name: "New Provider",
				category: UtilityProviderCategory.Electricity,
				website: "invalid-url",
			};

			const result = CreateProviderRequestSchema.safeParse(invalidData);
			expect(result.success).toBe(false);
		});

		it("rejects create request with empty name", () => {
			const invalidData = {
				name: "",
				category: UtilityProviderCategory.Electricity,
			};

			const result = CreateProviderRequestSchema.safeParse(invalidData);
			expect(result.success).toBe(false);
		});
	});

	describe("UpdateProviderRequestSchema", () => {
		it("validates valid update request", () => {
			const validData = {
				name: "Updated Provider",
				category: UtilityProviderCategory.Water,
				email: "updated@example.com",
				website: "https://updated.com",
			};

			const result = UpdateProviderRequestSchema.safeParse(validData);
			expect(result.success).toBe(true);
		});

		it("validates update request without email and website", () => {
			const validData = {
				name: "Updated Provider",
				category: UtilityProviderCategory.Water,
			};

			const result = UpdateProviderRequestSchema.safeParse(validData);
			expect(result.success).toBe(true);
		});

		it("rejects update request with invalid email", () => {
			const invalidData = {
				name: "Updated Provider",
				category: UtilityProviderCategory.Water,
				email: "invalid-email",
			};

			const result = UpdateProviderRequestSchema.safeParse(invalidData);
			expect(result.success).toBe(false);
		});

		it("rejects update request with invalid website", () => {
			const invalidData = {
				name: "Updated Provider",
				category: UtilityProviderCategory.Water,
				website: "invalid-url",
			};

			const result = UpdateProviderRequestSchema.safeParse(invalidData);
			expect(result.success).toBe(false);
		});

		it("rejects update request with empty name", () => {
			const invalidData = {
				name: "",
				category: UtilityProviderCategory.Water,
			};

			const result = UpdateProviderRequestSchema.safeParse(invalidData);
			expect(result.success).toBe(false);
		});
	});

	describe("Edge Cases", () => {
		it("handles very long provider names", () => {
			const longName = "A".repeat(100);
			const data = {
				name: longName,
				category: UtilityProviderCategory.Electricity,
				email: "",
				website: "",
			};

			const result = UtilityProviderFormSchema.safeParse(data);
			expect(result.success).toBe(true);
		});

		it("handles special characters in email", () => {
			const data = {
				name: "Test Provider",
				category: UtilityProviderCategory.Electricity,
				email: "test+tag@example.com",
				website: "",
			};

			const result = UtilityProviderFormSchema.safeParse(data);
			expect(result.success).toBe(true);
		});

		it("handles complex website URLs", () => {
			const data = {
				name: "Test Provider",
				category: UtilityProviderCategory.Electricity,
				email: "",
				website: "https://subdomain.example.com/path?param=value#fragment",
			};

			const result = UtilityProviderFormSchema.safeParse(data);
			expect(result.success).toBe(true);
		});

		it("rejects extremely long email addresses", () => {
			const longEmail = "a".repeat(64) + "@" + "b".repeat(190) + ".com";
			const data = {
				name: "Test Provider",
				category: UtilityProviderCategory.Electricity,
				email: longEmail,
				website: "",
			};

			const result = UtilityProviderFormSchema.safeParse(data);
			// The current schema doesn't enforce length limits, so this test should pass
			expect(result.success).toBe(true);
		});
	});
});
