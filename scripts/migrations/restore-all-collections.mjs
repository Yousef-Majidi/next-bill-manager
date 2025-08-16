#!/usr/bin/env node
import dotenv from "dotenv";
import { readline } from "readline";

// Load environment variables
dotenv.config();

// Helper function to prompt user for confirmation
function promptUser(question) {
	const rl = readline.createInterface({
		input: process.stdin,
		output: process.stdout,
	});

	return new Promise((resolve) => {
		rl.question(question, (answer) => {
			rl.close();
			resolve(answer.toLowerCase());
		});
	});
}

export default async function restoreAllCollections(db) {
	console.log("📊 Restoring all collections from backup");

	// Get all collections in the database
	const collections = await db.listCollections().toArray();
	const collectionNames = collections.map((col) => col.name);

	// Find backup collections
	const backupCollections = collectionNames.filter((name) =>
		name.includes("_backup_"),
	);

	if (backupCollections.length === 0) {
		console.log("❌ No backup collections found");
		console.log("   Expected format: collection_name_backup_YYYY-MM-DD");
		return;
	}

	// Group backup collections by timestamp
	const backupGroups = {};
	backupCollections.forEach((backupName) => {
		const match = backupName.match(/^(.+)_backup_(.+)$/);
		if (match) {
			const [, originalName, timestamp] = match;
			if (!backupGroups[timestamp]) {
				backupGroups[timestamp] = [];
			}
			backupGroups[timestamp].push({
				backupName,
				originalName,
			});
		}
	});

	// Show available backup timestamps
	const timestamps = Object.keys(backupGroups).sort().reverse(); // Newest first
	console.log("\n📋 Available backup timestamps:");
	timestamps.forEach((timestamp, index) => {
		const collections = backupGroups[timestamp];
		console.log(
			`   ${index + 1}. ${timestamp} (${collections.length} collections)`,
		);
		collections.forEach(({ originalName, backupName }) => {
			console.log(`      - ${originalName} → ${backupName}`);
		});
	});

	// Ask user to select backup timestamp
	const selectedTimestamp = timestamps[0]; // Default to newest
	console.log(`\n🕐 Selected backup timestamp: ${selectedTimestamp}`);

	const answer = await promptUser(
		`❓ Do you want to restore from ${selectedTimestamp}? (y/N): `,
	);

	if (answer !== "y" && answer !== "yes") {
		console.log("❌ Restore cancelled by user");
		return;
	}

	const collectionsToRestore = backupGroups[selectedTimestamp];

	// Show what will be restored
	console.log(`\n📋 Collections to restore:`);
	collectionsToRestore.forEach(({ originalName, backupName }) => {
		console.log(`   - ${backupName} → ${originalName}`);
	});

	// Ask for confirmation if any target collections have data
	const targetCollections = collectionsToRestore.map(
		({ originalName }) => originalName,
	);
	const existingCollections = collectionNames.filter((name) =>
		targetCollections.includes(name),
	);

	if (existingCollections.length > 0) {
		console.log(
			`\n⚠️  The following collections already exist and will be overwritten:`,
		);
		existingCollections.forEach((name) => {
			console.log(`   - ${name}`);
		});

		const overwriteAnswer = await promptUser(
			`❓ Do you want to overwrite existing collections? (y/N): `,
		);

		if (overwriteAnswer !== "y" && overwriteAnswer !== "yes") {
			console.log("❌ Restore cancelled by user");
			return;
		}
	}

	// Restore each collection
	let restoredCollections = 0;
	let totalDocuments = 0;
	let failedCollections = 0;

	console.log(`\n🔄 Starting restore process...`);

	for (const { originalName, backupName } of collectionsToRestore) {
		try {
			const backupCollection = db.collection(backupName);
			const targetCollection = db.collection(originalName);

			// Count documents in backup
			const backupCount = await backupCollection.countDocuments();

			if (backupCount === 0) {
				console.log(`   ⏭️  Skipping empty backup collection: ${backupName}`);
				continue;
			}

			console.log(
				`   🔄 Restoring ${backupName} → ${originalName} (${backupCount} documents)...`,
			);

			// Clear target collection if it exists
			await targetCollection.deleteMany({});

			// Get all documents from backup
			const documents = await backupCollection.find({}).toArray();

			// Insert documents into target collection
			const result = await targetCollection.insertMany(documents);

			// Verify restore
			const restoredCount = await targetCollection.countDocuments();

			if (backupCount !== restoredCount) {
				throw new Error(
					`Restore verification failed: backup has ${backupCount} documents, restored has ${restoredCount}`,
				);
			}

			console.log(
				`   ✅ ${originalName} restored successfully: ${result.insertedCount} documents`,
			);
			totalDocuments += result.insertedCount;
			restoredCollections++;
		} catch (error) {
			console.error(`   ❌ Failed to restore ${originalName}:`, error.message);
			failedCollections++;
		}
	}

	console.log("\n📊 Restore Summary:");
	console.log(`   Collections to restore: ${collectionsToRestore.length}`);
	console.log(`   Collections restored: ${restoredCollections}`);
	console.log(`   Collections failed: ${failedCollections}`);
	console.log(`   Total documents restored: ${totalDocuments}`);

	if (restoredCollections > 0) {
		console.log(`\n✅ Restore completed successfully!`);
		console.log(`📋 Restored from backup timestamp: ${selectedTimestamp}`);
	} else {
		console.log(`\n⚠️  No collections were restored`);
	}
}
