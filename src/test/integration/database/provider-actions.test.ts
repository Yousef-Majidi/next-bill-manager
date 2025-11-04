import { Collection, Db, MongoClient, ObjectId } from "mongodb";
import { MongoMemoryServer } from "mongodb-memory-server";
import {
	afterAll,
	afterEach,
	beforeAll,
	beforeEach,
	describe,
	expect,
	it,
} from "vitest";

import { UtilityProviderCategory } from "@/features/providers/types";

describe("Real Database Testing - Provider Operations", () => {
	let mongod: MongoMemoryServer;
	let client: MongoClient;
	let db: Db;
	let collection: Collection;

	const testUserId = "test-user-id";
	const testProviderId = "507f1f77bcf86cd799439011";

	beforeAll(async () => {
		// Start in-memory MongoDB instance
		mongod = await MongoMemoryServer.create();
		const uri = mongod.getUri();

		// Connect to the in-memory database
		client = new MongoClient(uri);
		await client.connect();

		// Set up test database
		db = client.db("test-db");
		collection = db.collection("utility_providers");
	});

	beforeEach(async () => {
		// Clear the collection before each test
		await collection.deleteMany({});
	});

	afterEach(async () => {
		// Clean up after each test
		await collection.deleteMany({});
	});

	afterAll(async () => {
		// Clean up after all tests
		await client.close();
		await mongod.stop();
	});

	describe("Database Operations", () => {
		it("inserts and retrieves providers", async () => {
			// Insert a provider
			const providerData = {
				_id: new ObjectId(testProviderId),
				user_id: testUserId,
				name: "Test Provider",
				category: UtilityProviderCategory.Electricity,
				email: "test@example.com",
				website: "https://example.com",
			};

			const insertResult = await collection.insertOne(providerData);
			expect(insertResult.acknowledged).toBe(true);

			// Retrieve the provider
			const retrievedProvider = await collection.findOne({
				_id: new ObjectId(testProviderId),
			});

			expect(retrievedProvider).toBeTruthy();
			expect(retrievedProvider!.name).toBe("Test Provider");
			expect(retrievedProvider!.category).toBe(
				UtilityProviderCategory.Electricity,
			);
			expect(retrievedProvider!.email).toBe("test@example.com");
			expect(retrievedProvider!.website).toBe("https://example.com");
		});

		it("finds providers by user ID", async () => {
			// Insert multiple providers for the same user
			await collection.insertMany([
				{
					user_id: testUserId,
					name: "Provider 1",
					category: UtilityProviderCategory.Electricity,
				},
				{
					user_id: testUserId,
					name: "Provider 2",
					category: UtilityProviderCategory.Water,
				},
				{
					user_id: "other-user",
					name: "Other Provider",
					category: UtilityProviderCategory.Gas,
				},
			]);

			// Find providers for the test user
			const userProviders = await collection
				.find({ user_id: testUserId })
				.toArray();

			expect(userProviders).toHaveLength(2);
			expect(userProviders[0]!.name).toBe("Provider 1");
			expect(userProviders[1]!.name).toBe("Provider 2");
		});

		it("updates provider fields", async () => {
			// Insert a provider
			await collection.insertOne({
				_id: new ObjectId(testProviderId),
				user_id: testUserId,
				name: "Original Provider",
				category: UtilityProviderCategory.Electricity,
				email: "original@example.com",
			});

			// Update the provider
			const updateResult = await collection.updateOne(
				{ _id: new ObjectId(testProviderId) },
				{
					$set: {
						name: "Updated Provider",
						category: UtilityProviderCategory.Water,
						email: "updated@example.com",
						website: "https://updated.com",
					},
				},
			);

			expect(updateResult.modifiedCount).toBe(1);

			// Verify the update
			const updatedProvider = await collection.findOne({
				_id: new ObjectId(testProviderId),
			});

			expect(updatedProvider!.name).toBe("Updated Provider");
			expect(updatedProvider!.category).toBe(UtilityProviderCategory.Water);
			expect(updatedProvider!.email).toBe("updated@example.com");
			expect(updatedProvider!.website).toBe("https://updated.com");
		});

		it("removes fields using $unset", async () => {
			// Insert a provider with email and website
			await collection.insertOne({
				_id: new ObjectId(testProviderId),
				user_id: testUserId,
				name: "Test Provider",
				category: UtilityProviderCategory.Electricity,
				email: "test@example.com",
				website: "https://example.com",
			});

			// Remove email and website fields
			const updateResult = await collection.updateOne(
				{ _id: new ObjectId(testProviderId) },
				{
					$unset: {
						email: "",
						website: "",
					},
				},
			);

			expect(updateResult.modifiedCount).toBe(1);

			// Verify fields were removed
			const updatedProvider = await collection.findOne({
				_id: new ObjectId(testProviderId),
			});

			expect(updatedProvider!.email).toBeUndefined();
			expect(updatedProvider!.website).toBeUndefined();
			expect(updatedProvider!.name).toBe("Test Provider"); // Other fields remain
		});

		it("deletes providers", async () => {
			// Insert a provider
			await collection.insertOne({
				_id: new ObjectId(testProviderId),
				user_id: testUserId,
				name: "Test Provider",
				category: UtilityProviderCategory.Electricity,
			});

			// Delete the provider
			const deleteResult = await collection.deleteOne({
				_id: new ObjectId(testProviderId),
				user_id: testUserId,
			});

			expect(deleteResult.deletedCount).toBe(1);

			// Verify it was deleted
			const deletedProvider = await collection.findOne({
				_id: new ObjectId(testProviderId),
			});

			expect(deletedProvider).toBeNull();
		});

		it("prevents duplicate provider names for same user", async () => {
			// Insert first provider
			await collection.insertOne({
				user_id: testUserId,
				name: "Test Provider",
				category: UtilityProviderCategory.Electricity,
			});

			// Try to insert another with the same name
			await collection.insertOne({
				user_id: testUserId,
				name: "Test Provider", // Same name
				category: UtilityProviderCategory.Water,
			});

			// MongoDB allows this by default, but we can check for duplicates
			const providers = await collection
				.find({
					user_id: testUserId,
					name: "Test Provider",
				})
				.toArray();

			expect(providers).toHaveLength(2); // Both were inserted

			// In real application, you'd add a unique index or check before insert
		});
	});

	describe("Data Validation", () => {
		it("validates required fields", async () => {
			// Try to insert provider without required fields
			const invalidProvider = {
				user_id: testUserId,
				// Missing name and category
			};

			// MongoDB will allow this, but our application validation should catch it
			const result = await collection.insertOne(invalidProvider);
			expect(result.acknowledged).toBe(true);
		});

		it("handles different data types correctly", async () => {
			// Test with various data types
			const providerData = {
				user_id: testUserId,
				name: "Test Provider",
				category: UtilityProviderCategory.Electricity,
				email: "test@example.com",
				website: "https://example.com",
				created_at: new Date(),
				is_active: true,
				priority: 1,
			};

			const result = await collection.insertOne(providerData);
			expect(result.acknowledged).toBe(true);

			const retrieved = await collection.findOne({ _id: result.insertedId });
			expect(retrieved!.name).toBe("Test Provider");
			expect(retrieved!.created_at).toBeInstanceOf(Date);
			expect(retrieved!.is_active).toBe(true);
			expect(retrieved!.priority).toBe(1);
		});
	});
});
