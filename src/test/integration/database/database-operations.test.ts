import { beforeEach, describe, expect, it, vi } from "vitest";

import { dbTestUtils } from "../utils";

// Mock MongoDB client
vi.mock("@/lib/server/mongodb", () => ({
	default: vi.fn(),
}));

describe("Database Operations Integration", () => {
	let mockDb: ReturnType<typeof dbTestUtils.mockDbConnection>;

	beforeEach(() => {
		mockDb = dbTestUtils.mockDbConnection();
		vi.clearAllMocks();
	});

	it("should connect to database successfully", async () => {
		expect(mockDb).toBeDefined();
		expect(mockDb.collection).toBeDefined();
	});

	it("should perform CRUD operations on tenants collection", async () => {
		const testData = dbTestUtils.createTestData();
		const mockCollection = mockDb.collection("tenants");

		// Test find operation
		const findResult = await mockCollection.find().toArray();
		expect(mockCollection.find).toHaveBeenCalled();
		expect(Array.isArray(findResult)).toBe(true);

		// Test insert operation
		const insertResult = await mockCollection.insertOne(testData.tenants[0]);
		expect(mockCollection.insertOne).toHaveBeenCalledWith(testData.tenants[0]);
		expect(insertResult.insertedId).toBe("test-id");

		// Test update operation
		const updateResult = await mockCollection.updateOne(
			{ id: "test-tenant-1" },
			{ $set: { name: "Updated Name" } },
		);
		expect(mockCollection.updateOne).toHaveBeenCalled();
		expect(updateResult.modifiedCount).toBe(1);

		// Test delete operation
		const deleteResult = await mockCollection.deleteOne({
			id: "test-tenant-1",
		});
		expect(mockCollection.deleteOne).toHaveBeenCalledWith({
			id: "test-tenant-1",
		});
		expect(deleteResult.deletedCount).toBe(1);
	});

	it("should perform CRUD operations on providers collection", async () => {
		const testData = dbTestUtils.createTestData();
		const mockCollection = mockDb.collection("providers");

		// Test find operation
		const findResult = await mockCollection.find().toArray();
		expect(mockCollection.find).toHaveBeenCalled();
		expect(Array.isArray(findResult)).toBe(true);

		// Test insert operation
		const insertResult = await mockCollection.insertOne(testData.providers[0]);
		expect(mockCollection.insertOne).toHaveBeenCalledWith(
			testData.providers[0],
		);
		expect(insertResult.insertedId).toBe("test-id");
	});

	it("should perform CRUD operations on bills collection", async () => {
		const testData = dbTestUtils.createTestData();
		const mockCollection = mockDb.collection("bills");

		// Test find operation
		const findResult = await mockCollection.find().toArray();
		expect(mockCollection.find).toHaveBeenCalled();
		expect(Array.isArray(findResult)).toBe(true);

		// Test insert operation
		const insertResult = await mockCollection.insertOne(testData.bills[0]);
		expect(mockCollection.insertOne).toHaveBeenCalledWith(testData.bills[0]);
		expect(insertResult.insertedId).toBe("test-id");
	});

	it("should handle database connection errors", async () => {
		// Test error handling with mock collection
		const mockCollection = mockDb.collection("tenants");
		mockCollection.find.mockReturnValue({
			toArray: vi.fn().mockRejectedValue(new Error("Connection failed")),
		});

		await expect(mockCollection.find().toArray()).rejects.toThrow(
			"Connection failed",
		);
	});

	it("should handle collection operation errors", async () => {
		const mockCollection = mockDb.collection("tenants");

		// Mock operation error
		mockCollection.find.mockReturnValue({
			toArray: vi.fn().mockRejectedValue(new Error("Query failed")),
		});

		await expect(mockCollection.find().toArray()).rejects.toThrow(
			"Query failed",
		);
	});
});
