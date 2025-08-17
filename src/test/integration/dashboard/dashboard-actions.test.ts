import { beforeEach, describe, expect, it, vi } from "vitest";

import {
	getDashboardData,
	getDashboardLayoutData,
} from "@/features/dashboard/actions";
import { UtilityProviderCategory } from "@/features/providers/types";
import { initializeConsolidatedBill } from "@/lib/common/utils";
import {
	getConsolidatedBills,
	getTenants,
	getUser,
	getUtilityProviders,
} from "@/lib/data";
import { fetchUserBills } from "@/lib/gmail";
import type { ConsolidatedBill, UtilityBill } from "@/types";

// Mock the dependencies
vi.mock("@/lib/data", () => ({
	getUser: vi.fn(),
	getUtilityProviders: vi.fn(),
	getTenants: vi.fn(),
	getConsolidatedBills: vi.fn(),
}));

vi.mock("@/lib/gmail", () => ({
	fetchUserBills: vi.fn(),
}));

vi.mock("@/lib/common/utils", () => ({
	initializeConsolidatedBill: vi.fn(),
}));

describe("Dashboard Actions", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe("getDashboardData", () => {
		it("should return dashboard data successfully", async () => {
			const mockUser = {
				id: "user-1",
				name: "Test User",
				email: "test@example.com",
				accessToken: "token",
				accessTokenExp: 1718534400,
			};
			const mockProviders = [
				{
					id: "provider-1",
					name: "Test Provider",
					userId: "user-1",
					category: UtilityProviderCategory.Electricity,
				},
			];
			const mockBills = [
				{
					id: "bill-1",
					amount: 100,
					gmailMessageId: "message-1",
					utilityProvider: mockProviders[0],
					month: 1,
					year: 2024,
				},
			] as UtilityBill[];
			const mockConsolidatedBill = {
				id: "consolidated-1",
				totalAmount: 100,
				userId: "user-1",
				month: 1,
				year: 2024,
				tenantId: "tenant-1",
				categories: {
					Water: {
						gmailMessageId: "msg1",
						providerId: "p1",
						providerName: "Test",
						amount: 50,
					},
					Gas: {
						gmailMessageId: "msg2",
						providerId: "p2",
						providerName: "Test2",
						amount: 30,
					},
					Electricity: {
						gmailMessageId: "msg3",
						providerId: "p3",
						providerName: "Test3",
						amount: 20,
					},
				},
				paid: false,
				dateSent: null,
				datePaid: null,
			} as ConsolidatedBill;

			vi.mocked(getUser).mockResolvedValue(mockUser);
			vi.mocked(getUtilityProviders).mockResolvedValue(mockProviders);
			vi.mocked(fetchUserBills).mockResolvedValue(mockBills);
			vi.mocked(initializeConsolidatedBill).mockReturnValue(
				mockConsolidatedBill,
			);

			const result = await getDashboardData();

			expect(result.success).toBe(true);
			expect(result.data).toEqual({
				user: mockUser,
				providers: mockProviders,
				currentMonthBill: mockConsolidatedBill,
			});
		});

		it("should handle errors gracefully", async () => {
			vi.mocked(getUser).mockRejectedValue(new Error("Database error"));

			const result = await getDashboardData();

			expect(result.success).toBe(false);
			expect(result.error).toBe("Database error");
		});

		it("should handle unknown errors", async () => {
			vi.mocked(getUser).mockRejectedValue("Unknown error");

			const result = await getDashboardData();

			expect(result.success).toBe(false);
			expect(result.error).toBe("Failed to fetch dashboard data");
		});
	});

	describe("getDashboardLayoutData", () => {
		it("should return layout data successfully", async () => {
			const mockUser = {
				id: "user-1",
				name: "Test User",
				email: "test@example.com",
				accessToken: "token",
				accessTokenExp: 1718534400,
			};
			const mockProviders = [
				{
					id: "provider-1",
					name: "Test Provider",
					userId: "user-1",
					category: UtilityProviderCategory.Electricity,
				},
			];
			const mockTenants = [
				{
					id: "tenant-1",
					name: "Test Tenant",
					userId: "user-1",
					email: "tenant@example.com",
					shares: { Water: 1, Gas: 1, Electricity: 1 },
					outstandingBalance: 0,
				},
			];
			const mockBills = [
				{
					id: "bill-1",
					totalAmount: 100,
					userId: "user-1",
					month: 1,
					year: 2024,
					tenantId: "tenant-1",
					categories: {
						Water: {
							gmailMessageId: "msg1",
							providerId: "p1",
							providerName: "Test",
							amount: 50,
						},
						Gas: {
							gmailMessageId: "msg2",
							providerId: "p2",
							providerName: "Test2",
							amount: 30,
						},
						Electricity: {
							gmailMessageId: "msg3",
							providerId: "p3",
							providerName: "Test3",
							amount: 20,
						},
					},
					paid: false,
					dateSent: null,
					datePaid: null,
				},
			];

			vi.mocked(getUser).mockResolvedValue(mockUser);
			vi.mocked(getUtilityProviders).mockResolvedValue(mockProviders);
			vi.mocked(getTenants).mockResolvedValue(mockTenants);
			vi.mocked(getConsolidatedBills).mockResolvedValue(mockBills);

			const result = await getDashboardLayoutData();

			expect(result.success).toBe(true);
			expect(result.data).toEqual({
				user: mockUser,
				providers: mockProviders,
				tenants: mockTenants,
				billsHistory: mockBills,
			});
		});

		it("should handle errors gracefully", async () => {
			vi.mocked(getUser).mockRejectedValue(new Error("Database error"));

			const result = await getDashboardLayoutData();

			expect(result.success).toBe(false);
			expect(result.error).toBe("Database error");
		});

		it("should handle unknown errors", async () => {
			vi.mocked(getUser).mockRejectedValue("Unknown error");

			const result = await getDashboardLayoutData();

			expect(result.success).toBe(false);
			expect(result.error).toBe("Failed to fetch layout data");
		});
	});
});
