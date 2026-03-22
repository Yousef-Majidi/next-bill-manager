#!/usr/bin/env node
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const COLLECTION_NAME = process.env.MONGODB_CONSOLIDATED_BILLS;

if (!COLLECTION_NAME) {
	throw new Error("Missing MONGODB_CONSOLIDATED_BILLS environment variable");
}

// Helper function to normalize date to ISO string
function normalizeDate(dateValue) {
	if (!dateValue) {
		return null;
	}

	// If already a Date object, convert to ISO
	if (dateValue instanceof Date) {
		return dateValue.toISOString();
	}

	// If it's a string, try to parse it
	if (typeof dateValue === "string") {
		// Check if it's already an ISO string
		if (dateValue.match(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/)) {
			return dateValue;
		}

		// Try to parse the date string (handles toDateString() format and others)
		const parsed = new Date(dateValue);
		if (!isNaN(parsed.getTime())) {
			return parsed.toISOString();
		}
	}

	// If we can't parse it, return null
	console.warn(`   ⚠️  Could not parse date: ${dateValue}`);
	return null;
}

export default async function normalizeBillDates(db) {
	const collection = db.collection(COLLECTION_NAME);

	console.log(`📊 Normalizing dates in collection: ${COLLECTION_NAME}`);

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

			// Check if document needs date normalization
			let needsUpdate = false;
			const updateFields = {};

			// Normalize date_sent
			if (doc.date_sent !== undefined && doc.date_sent !== null) {
				const normalizedDateSent = normalizeDate(doc.date_sent);
				if (normalizedDateSent !== doc.date_sent) {
					updateFields.date_sent = normalizedDateSent;
					needsUpdate = true;
				}
			}

			// Normalize date_paid
			if (doc.date_paid !== undefined && doc.date_paid !== null) {
				const normalizedDatePaid = normalizeDate(doc.date_paid);
				if (normalizedDatePaid !== doc.date_paid) {
					updateFields.date_paid = normalizedDatePaid;
					needsUpdate = true;
				}
			}

			// Update document if needed
			if (needsUpdate) {
				try {
					// If normalized date is null, unset the field
					const setFields = {};
					const unsetFields = {};

					if (updateFields.date_sent !== null) {
						setFields.date_sent = updateFields.date_sent;
					} else {
						unsetFields.date_sent = "";
					}

					if (updateFields.date_paid !== null) {
						setFields.date_paid = updateFields.date_paid;
					} else {
						unsetFields.date_paid = "";
					}

					const updateOperation = {};
					if (Object.keys(setFields).length > 0) {
						updateOperation.$set = setFields;
					}
					if (Object.keys(unsetFields).length > 0) {
						updateOperation.$unset = unsetFields;
					}

					await collection.updateOne({ _id: doc._id }, updateOperation);
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
