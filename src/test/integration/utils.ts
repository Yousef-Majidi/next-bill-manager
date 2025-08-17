import { HttpResponse, http } from "msw";
import { vi } from "vitest";

import { server } from "./api/msw-setup";

// API testing utilities
export const apiTestUtils = {
	// Mock API response
	mockApiResponse: (
		method: string,
		path: string,
		response: Record<string, unknown>,
		status = 200,
	) => {
		server.use(
			http[method.toLowerCase() as keyof typeof http](path, () => {
				return HttpResponse.json(response, { status });
			}),
		);
	},

	// Mock API error
	mockApiError: (
		method: string,
		path: string,
		status = 500,
		error = "Internal Server Error",
	) => {
		server.use(
			http[method.toLowerCase() as keyof typeof http](path, () => {
				return new HttpResponse(error, { status });
			}),
		);
	},

	// Wait for API call to complete
	waitForApiCall: () => new Promise((resolve) => setTimeout(resolve, 100)),
};

// Database testing utilities
export const dbTestUtils = {
	// Mock database connection
	mockDbConnection: () => ({
		collection: vi.fn().mockReturnValue({
			find: vi.fn().mockReturnValue({
				toArray: vi.fn().mockResolvedValue([]),
			}),
			findOne: vi.fn().mockResolvedValue(null),
			insertOne: vi.fn().mockResolvedValue({ insertedId: "test-id" }),
			updateOne: vi.fn().mockResolvedValue({ modifiedCount: 1 }),
			deleteOne: vi.fn().mockResolvedValue({ deletedCount: 1 }),
		}),
	}),

	// Create test data
	createTestData: () => ({
		tenants: [
			{
				id: "test-tenant-1",
				name: "Test Tenant 1",
				email: "test1@example.com",
				phone: "+1234567890",
				address: "123 Test St",
				createdAt: new Date("2024-01-01"),
				updatedAt: new Date("2024-01-01"),
			},
		],
		providers: [
			{
				id: "test-provider-1",
				name: "Test Provider 1",
				type: "electricity",
				accountNumber: "TEST123456",
				createdAt: new Date("2024-01-01"),
				updatedAt: new Date("2024-01-01"),
			},
		],
		bills: [
			{
				id: "test-bill-1",
				tenantId: "test-tenant-1",
				providerId: "test-provider-1",
				amount: 100.0,
				dueDate: new Date("2024-02-01"),
				status: "pending",
				createdAt: new Date("2024-01-01"),
				updatedAt: new Date("2024-01-01"),
			},
		],
	}),
};

// Integration test helpers
export const integrationHelpers = {
	// Setup test environment
	setupTestEnv: () => {
		// Reset all mocks
		vi.clearAllMocks();

		// Setup default API handlers
		server.listen();
	},

	// Cleanup test environment
	cleanupTestEnv: () => {
		server.resetHandlers();
		server.close();
		vi.clearAllMocks();
	},

	// Mock authentication
	mockAuth: (user = null) => {
		vi.mock("next-auth/react", () => ({
			useSession: () => ({
				data: user,
				status: user ? "authenticated" : "unauthenticated",
			}),
			signIn: vi.fn(),
			signOut: vi.fn(),
		}));
	},
};
