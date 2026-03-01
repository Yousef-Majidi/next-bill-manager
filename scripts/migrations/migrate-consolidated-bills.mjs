#!/usr/bin/env node
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const COLLECTION_NAME = process.env.MONGODB_CONSOLIDATED_BILLS;

if (!COLLECTION_NAME) {
	throw new Error("Missing MONGODB_CONSOLIDATED_BILLS environment variable");
}

// Helper function to normalize category data
function normalizeCategoryData(categoryData) {
	if (!categoryData || typeof categoryData !== "object") {
		return null;
	}

	// Get values from either camelCase or snake_case fields
	const gmailMessageId =
		categoryData.gmail_message_id ||
		categoryData.gmailMessageId ||
		"no-gmail-id";
	const providerId =
		categoryData.provider_id || categoryData.providerId || "no-provider-id";
	const providerName =
		categoryData.provider_name ||
		categoryData.providerName ||
		"Unknown Provider";
	const amount = categoryData.amount || 0;

	// Replace empty strings with defaults
	return {
		gmail_message_id: gmailMessageId === "" ? "no-gmail-id" : gmailMessageId,
		provider_id: providerId === "" ? "no-provider-id" : providerId,
		provider_name: providerName === "" ? "Unknown Provider" : providerName,
		amount: amount,
	};
}

// Helper function to normalize categories object
function normalizeCategories(categories) {
	if (!categories || typeof categories !== "object") {
		return {};
	}

	const normalizedCategories = {};

	for (const [categoryKey, categoryData] of Object.entries(categories)) {
		const normalized = normalizeCategoryData(categoryData);
		if (normalized) {
			normalizedCategories[categoryKey] = normalized;
		}
	}

	return normalizedCategories;
}

export default async function migrateConsolidatedBills(db) {
	const collection = db.collection(COLLECTION_NAME);

	console.log(`📊 Migrating collection: ${COLLECTION_NAME}`);

	// Get all documents
	const documents = await collection.find({}).toArray();
	console.log(`   Total documents to process: ${documents.length}`);

	if (documents.length === 0) {
		console.log("⚠️  Collection is empty, no migration needed");
		return;
	}

	let processedCount = 0;
	let updatedCount = 0;
	let skippedCount = 0;

	// Process documents in batches
	const batchSize = 10;

	for (let i = 0; i < documents.length; i += batchSize) {
		const batch = documents.slice(i, i + batchSize);

		for (const doc of batch) {
			processedCount++;

			// Check if document needs migration
			let needsUpdate = false;
			let updatedDoc = { ...doc };

			// Check categories for camelCase field names or empty strings
			if (doc.categories && typeof doc.categories === "object") {
				const normalizedCategories = normalizeCategories(doc.categories);

				// Compare if normalization changed anything
				if (
					JSON.stringify(doc.categories) !==
					JSON.stringify(normalizedCategories)
				) {
					updatedDoc.categories = normalizedCategories;
					needsUpdate = true;
				}
			}

			// Add missing fields with defaults
			if (doc.paid === undefined) {
				updatedDoc.paid = false;
				needsUpdate = true;
			}

			if (doc.date_sent === undefined) {
				updatedDoc.date_sent = null;
				needsUpdate = true;
			}

			if (doc.date_paid === undefined) {
				updatedDoc.date_paid = null;
				needsUpdate = true;
			}

			// Update document if needed
			if (needsUpdate) {
				try {
					await collection.updateOne({ _id: doc._id }, { $set: updatedDoc });
					updatedCount++;
					console.log(
						`   ✅ Updated document ${processedCount}/${documents.length}: ${doc._id}`,
					);
				} catch (error) {
					console.error(
						`   ❌ Failed to update document ${doc._id}:`,
						error.message,
					);
					skippedCount++;
				}
			} else {
				skippedCount++;
				console.log(
					`   ⏭️  Skipped document ${processedCount}/${documents.length}: ${doc._id} (no changes needed)`,
				);
			}
		}

		// Progress update
		console.log(
			`   📈 Progress: ${processedCount}/${documents.length} documents processed`,
		);
	}

	console.log("\n📊 Migration Summary:");
	console.log(`   Total documents: ${documents.length}`);
	console.log(`   Documents processed: ${processedCount}`);
	console.log(`   Documents updated: ${updatedCount}`);
	console.log(`   Documents skipped: ${skippedCount}`);

	if (updatedCount > 0) {
		console.log(`\n✅ Migration completed successfully!`);
		console.log(`   ${updatedCount} documents were updated`);
	} else {
		console.log(`\n✅ Migration completed - no changes were needed`);
	}
}
