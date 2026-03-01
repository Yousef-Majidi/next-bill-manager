#!/usr/bin/env node
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

export default async function backupAllCollections(db) {
	console.log("📊 Creating backup of all database collections");

	// Get all collections in the database
	const collections = await db.listCollections().toArray();
	const collectionNames = collections.map((col) => col.name);

	console.log(
		`📁 Found ${collectionNames.length} collections: ${collectionNames.join(", ")}`,
	);

	if (collectionNames.length === 0) {
		console.log("⚠️  No collections found to backup");
		return;
	}

	// Create backup timestamp
	const timestamp = new Date().toISOString().split("T")[0]; // YYYY-MM-DD format
	const backupSuffix = `_backup_${timestamp}`;

	console.log(`🕐 Backup timestamp: ${timestamp}`);

	let totalDocuments = 0;
	let backedUpCollections = 0;
	let skippedCollections = 0;

	// Process each collection
	for (const collectionName of collectionNames) {
		const collection = db.collection(collectionName);
		const backupCollectionName = `${collectionName}${backupSuffix}`;

		// Skip if this is already a backup collection
		if (collectionName.includes("_backup_")) {
			console.log(`   ⏭️  Skipping backup collection: ${collectionName}`);
			skippedCollections++;
			continue;
		}

		// Count documents in source collection
		const sourceCount = await collection.countDocuments();

		if (sourceCount === 0) {
			console.log(
				`   ⏭️  Skipping empty collection: ${collectionName} (0 documents)`,
			);
			skippedCollections++;
			continue;
		}

		// Check if backup collection already exists
		const existingBackups = await db
			.listCollections({ name: backupCollectionName })
			.toArray();
		if (existingBackups.length > 0) {
			console.log(
				`   ⚠️  Backup collection ${backupCollectionName} already exists, skipping`,
			);
			skippedCollections++;
			continue;
		}

		try {
			console.log(
				`   🔄 Backing up ${collectionName} (${sourceCount} documents)...`,
			);

			// Get all documents from source collection
			const documents = await collection.find({}).toArray();

			// Insert documents into backup collection
			const backupCollection = db.collection(backupCollectionName);
			const result = await backupCollection.insertMany(documents);

			// Verify backup
			const backupCount = await backupCollection.countDocuments();

			if (sourceCount !== backupCount) {
				throw new Error(
					`Backup verification failed: source has ${sourceCount} documents, backup has ${backupCount}`,
				);
			}

			console.log(
				`   ✅ ${collectionName} backed up successfully: ${result.insertedCount} documents`,
			);
			totalDocuments += result.insertedCount;
			backedUpCollections++;
		} catch (error) {
			console.error(`   ❌ Failed to backup ${collectionName}:`, error.message);
			skippedCollections++;
		}
	}

	console.log("\n📊 Backup Summary:");
	console.log(`   Collections processed: ${collectionNames.length}`);
	console.log(`   Collections backed up: ${backedUpCollections}`);
	console.log(`   Collections skipped: ${skippedCollections}`);
	console.log(`   Total documents backed up: ${totalDocuments}`);

	if (backedUpCollections > 0) {
		console.log(`\n✅ Backup completed successfully!`);
		console.log(`📋 Backup collections created with suffix: ${backupSuffix}`);
		console.log(
			`📋 To restore from this backup, use: node scripts/migrate.mjs scripts/migrations/restore-all-collections.mjs`,
		);
	} else {
		console.log(`\n⚠️  No collections were backed up`);
	}
}
