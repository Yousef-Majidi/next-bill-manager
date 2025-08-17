import { describe, expect, it } from "vitest";

import {
	capitalize,
	cn,
	delay,
	formatCurrency,
	formatDate,
	formatDateTime,
	groupBy,
	isValidEmail,
	isValidPhoneNumber,
	omit,
	pick,
	retry,
	roundToCurrency,
	truncate,
	uniqueBy,
} from "@/features/shared/utils";

describe("Shared Utilities", () => {
	describe("cn (className utility)", () => {
		it("should merge class names correctly", () => {
			const result = cn("text-red-500", "bg-blue-500", "text-red-500");
			expect(result).toBe("bg-blue-500 text-red-500");
		});

		it("should handle conditional classes", () => {
			const isActive = true;
			const result = cn("base-class", isActive && "active-class");
			expect(result).toBe("base-class active-class");
		});
	});

	describe("roundToCurrency", () => {
		it("should round to 2 decimal places", () => {
			expect(roundToCurrency(10.567)).toBe(10.57);
			expect(roundToCurrency(10.564)).toBe(10.56);
			expect(roundToCurrency(10)).toBe(10);
		});
	});

	describe("formatCurrency", () => {
		it("should format currency correctly", () => {
			expect(formatCurrency(10.5)).toBe("$10.50");
			expect(formatCurrency(1000)).toBe("$1,000.00");
		});
	});

	describe("formatDate", () => {
		it("should format date correctly", () => {
			const date = new Date("2023-12-25T12:00:00Z");
			const result = formatDate(date);
			expect(result).toContain("December 25, 2023");
		});
	});

	describe("formatDateTime", () => {
		it("should format date and time correctly", () => {
			const date = new Date("2023-12-25T14:30:00");
			const result = formatDateTime(date);
			expect(result).toMatch(/Dec 25, 2023.*2:30/);
		});
	});

	describe("isValidEmail", () => {
		it("should validate correct email addresses", () => {
			expect(isValidEmail("test@example.com")).toBe(true);
			expect(isValidEmail("user.name@domain.co.uk")).toBe(true);
		});

		it("should reject invalid email addresses", () => {
			expect(isValidEmail("invalid-email")).toBe(false);
			expect(isValidEmail("test@")).toBe(false);
			expect(isValidEmail("@domain.com")).toBe(false);
		});
	});

	describe("isValidPhoneNumber", () => {
		it("should validate correct phone numbers", () => {
			expect(isValidPhoneNumber("1234567890")).toBe(true);
			expect(isValidPhoneNumber("+1-234-567-8900")).toBe(true);
			expect(isValidPhoneNumber("(123) 456-7890")).toBe(true);
		});

		it("should reject invalid phone numbers", () => {
			expect(isValidPhoneNumber("123")).toBe(false);
			expect(isValidPhoneNumber("abc")).toBe(false);
		});
	});

	describe("groupBy", () => {
		it("should group items by key", () => {
			const items = [
				{ id: 1, category: "A" },
				{ id: 2, category: "B" },
				{ id: 3, category: "A" },
			];

			const result = groupBy(items, (item) => item.category);
			expect(result).toEqual({
				A: [
					{ id: 1, category: "A" },
					{ id: 3, category: "A" },
				],
				B: [{ id: 2, category: "B" }],
			});
		});
	});

	describe("uniqueBy", () => {
		it("should return unique items by key", () => {
			const items = [
				{ id: 1, name: "John" },
				{ id: 2, name: "Jane" },
				{ id: 3, name: "John" },
			];

			const result = uniqueBy(items, (item) => item.name);
			expect(result).toHaveLength(2);
			expect(result.map((item) => item.name)).toEqual(["John", "Jane"]);
		});
	});

	describe("pick", () => {
		it("should pick specified keys from object", () => {
			const obj = { a: 1, b: 2, c: 3 };
			const result = pick(obj, ["a", "c"]);
			expect(result).toEqual({ a: 1, c: 3 });
		});
	});

	describe("omit", () => {
		it("should omit specified keys from object", () => {
			const obj = { a: 1, b: 2, c: 3 };
			const result = omit(obj, ["b"]);
			expect(result).toEqual({ a: 1, c: 3 });
		});
	});

	describe("capitalize", () => {
		it("should capitalize first letter", () => {
			expect(capitalize("hello")).toBe("Hello");
			expect(capitalize("WORLD")).toBe("World");
		});
	});

	describe("truncate", () => {
		it("should truncate long strings", () => {
			expect(truncate("Hello World", 5)).toBe("Hello...");
			expect(truncate("Short", 10)).toBe("Short");
		});

		it("should use custom suffix", () => {
			expect(truncate("Hello World", 5, "***")).toBe("Hello***");
		});
	});

	describe("delay", () => {
		it("should delay execution", async () => {
			const start = Date.now();
			await delay(100);
			const end = Date.now();
			expect(end - start).toBeGreaterThanOrEqual(90);
		});
	});

	describe("retry", () => {
		it("should retry failed operations", async () => {
			let attempts = 0;
			const fn = async () => {
				attempts++;
				if (attempts < 3) {
					throw new Error("Failed");
				}
				return "success";
			};

			const result = await retry(fn, 3, 10);
			expect(result).toBe("success");
			expect(attempts).toBe(3);
		});

		it("should throw after max attempts", async () => {
			const fn = async () => {
				throw new Error("Always fails");
			};

			await expect(retry(fn, 2, 10)).rejects.toThrow("Always fails");
		});
	});
});
