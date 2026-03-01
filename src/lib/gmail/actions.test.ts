import { beforeEach, describe, expect, it, vi } from "vitest";

import {
	getConsolidatedBills,
	markBillAsPaid,
	updateTenantBalance,
} from "@/lib/data";
import { ConsolidatedBill, Payment, Tenant } from "@/types";

import { applyPaymentToBills } from "./actions";

// Mock the dependencies
vi.mock("@/lib/data", () => ({
	getUser: vi.fn(),
	getConsolidatedBills: vi.fn(),
	markBillAsPaid: vi.fn(),
	updateTenantBalance: vi.fn(),
}));

vi.mock("@/lib/gmail/client", () => ({
	getGmailClient: vi.fn(),
}));

vi.mock("@/lib/common/utils", () => ({
	getTenantShares: vi.fn(),
	roundToCurrency: (val: number) => Math.round(val * 100) / 100,
}));

vi.mock("@/lib/common/error-handling", () => ({
	safeExecuteAsync: vi.fn((fn) =>
		fn()
			.then((data: any) => ({ success: true, data }))
			.catch((error: any) => ({ success: false, error })),
	),
}));

describe("applyPaymentToBills", () => {
	const mockUserId = "user-1";
	const mockTenant: Tenant = {
		id: "tenant-1",
		name: "Test Tenant",
		userId: mockUserId,
		email: "tenant@example.com",
		shares: {
			Water: 0.5,
			Gas: 0.5,
			Electricity: 0.5,
		},
		outstandingBalance: 100, // Current balance including all unpaid bills
	};
	const mockPayment: Payment = {
		amount: 100,
		gmailMessageId: "payment-msg-1",
		sentFrom: "Test Tenant",
		date: "2024-01-01",
	};
	const mockBillIds = ["bill-1"];
	const mockBills: ConsolidatedBill[] = [
		{
			id: "bill-1",
			userId: mockUserId,
			month: 12,
			year: 2023,
			tenantId: "tenant-1",
			totalAmount: 691.73,
			categories: {
				Water: {
					gmailMessageId: "msg-w",
					providerId: "p-w",
					providerName: "Water Co",
					amount: 100,
				},
				Gas: {
					gmailMessageId: "msg-g",
					providerId: "p-g",
					providerName: "Gas Co",
					amount: 100,
				},
				Electricity: {
					gmailMessageId: "msg-e",
					providerId: "p-e",
					providerName: "Elec Co",
					amount: 100,
				},
			},
			paid: false,
			dateSent: "2023-12-01",
			datePaid: null,
			paymentMessageId: null,
		},
	];

	beforeEach(() => {
		vi.clearAllMocks();
		vi.mocked(getConsolidatedBills).mockResolvedValue(mockBills);
	});

	it("should correctly update balance to 0 for exact payment", async () => {
		const result = await applyPaymentToBills(
			mockUserId,
			mockTenant,
			mockPayment,
			mockBillIds,
		);

		expect(result.success).toBe(true);
		expect(result.newBalance).toBe(0);
		expect(updateTenantBalance).toHaveBeenCalledWith(
			mockUserId,
			mockTenant.id,
			0,
		);
		expect(markBillAsPaid).toHaveBeenCalledWith(
			mockUserId,
			"bill-1",
			mockPayment.gmailMessageId,
		);
	});

	it("should correctly handle underpayment", async () => {
		const underpayment = { ...mockPayment, amount: 60 };
		const result = await applyPaymentToBills(
			mockUserId,
			mockTenant,
			underpayment,
			mockBillIds,
		);

		expect(result.success).toBe(true);
		expect(result.newBalance).toBe(40); // 100 - 60
		expect(updateTenantBalance).toHaveBeenCalledWith(
			mockUserId,
			mockTenant.id,
			40,
		);
	});

	it("should correctly handle overpayment (credit)", async () => {
		const overpayment = { ...mockPayment, amount: 150 };
		const result = await applyPaymentToBills(
			mockUserId,
			mockTenant,
			overpayment,
			mockBillIds,
		);

		expect(result.success).toBe(true);
		expect(result.newBalance).toBe(-50); // 100 - 150 = -50 credit
		expect(updateTenantBalance).toHaveBeenCalledWith(
			mockUserId,
			mockTenant.id,
			-50,
		);
	});

	it("should handle multiple bills correctly", async () => {
		const multiBills = [
			...mockBills,
			{
				id: "bill-2",
				userId: mockUserId,
				month: 11,
				year: 2023,
				tenantId: "tenant-1",
				totalAmount: 500,
				categories: {
					Water: {
						gmailMessageId: "msg-w",
						providerId: "p-w",
						providerName: "Water Co",
						amount: 100,
					},
					Gas: {
						gmailMessageId: "msg-g",
						providerId: "p-g",
						providerName: "Gas Co",
						amount: 100,
					},
					Electricity: {
						gmailMessageId: "msg-e",
						providerId: "p-e",
						providerName: "Elec Co",
						amount: 100,
					},
				},
				paid: false,
				dateSent: "2023-11-01",
				datePaid: null,
				paymentMessageId: null,
			},
		];
		vi.mocked(getConsolidatedBills).mockResolvedValue(multiBills);
		const multiBillIds = ["bill-1", "bill-2"];

		// Tenant balance remains 100 (in this hypothetical scenario, maybe the balance wasn't updated correctly before,
		// but our function should just trust the provided balance).
		// If the balance IS correctly maintained, it would be 100 + 500 = 600.
		// Let's assume the tenant balance is 600.
		const tenantWithHigherBalance = { ...mockTenant, outstandingBalance: 600 };
		const fullPayment = { ...mockPayment, amount: 600 };

		const result = await applyPaymentToBills(
			mockUserId,
			tenantWithHigherBalance,
			fullPayment,
			multiBillIds,
		);

		expect(result.success).toBe(true);
		expect(result.newBalance).toBe(0);
		expect(markBillAsPaid).toHaveBeenCalledWith(
			mockUserId,
			"bill-1",
			mockPayment.gmailMessageId,
		);
		expect(markBillAsPaid).toHaveBeenCalledWith(
			mockUserId,
			"bill-2",
			mockPayment.gmailMessageId,
		);
		expect(updateTenantBalance).toHaveBeenCalledWith(
			mockUserId,
			mockTenant.id,
			0,
		);
	});
});
