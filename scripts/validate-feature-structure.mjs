#!/usr/bin/env node
import fs from "fs";
import { glob } from "glob";
import path from "path";

// expected feature structure
const EXPECTED_STRUCTURE = {
	components: "index.ts",
	types: "index.ts",
	actions: "index.ts",
	hooks: "index.ts",
	utils: "index.ts",
	"index.ts": true,
};

// validate a single feature directory
const validateFeature = (featurePath) => {
	const featureName = path.basename(featurePath);
	const issues = [];

	// check if feature has index.ts
	const indexPath = path.join(featurePath, "index.ts");
	if (!fs.existsSync(indexPath)) {
		issues.push("Missing index.ts file");
	}

	// check subdirectories
	Object.entries(EXPECTED_STRUCTURE).forEach(([dir, expectedFile]) => {
		if (dir === "index.ts") return;

		const dirPath = path.join(featurePath, dir);
		if (fs.existsSync(dirPath)) {
			// directory exists, check if it has index.ts
			const filePath = path.join(dirPath, expectedFile);
			if (!fs.existsSync(filePath)) {
				issues.push(`Missing ${dir}/${expectedFile}`);
			}
		}
	});

	// check for unexpected files/directories
	const entries = fs.readdirSync(featurePath, { withFileTypes: true });
	entries.forEach((entry) => {
		const name = entry.name;
		if (name === "index.ts") return;

		if (entry.isDirectory()) {
			if (!EXPECTED_STRUCTURE[name]) {
				issues.push(`Unexpected directory: ${name}`);
			}
		} else if (entry.isFile() && name.endsWith(".ts")) {
			issues.push(
				`Unexpected file: ${name} (should be in appropriate subdirectory)`,
			);
		}
	});

	return {
		feature: featureName,
		path: featurePath,
		issues,
	};
};

// main function
const main = async () => {
	console.log("🔍 Validating feature structure...\n");

	const featureDirs = await glob("src/features/*/", { onlyDirectories: true });
	let totalIssues = 0;

	for (const featureDir of featureDirs) {
		const result = validateFeature(featureDir);

		if (result.issues.length > 0) {
			console.log(`❌ ${result.feature}:`);
			result.issues.forEach((issue) => {
				console.log(`   ${issue}`);
			});
			console.log("");
			totalIssues += result.issues.length;
		} else {
			console.log(`✅ ${result.feature}: Valid structure`);
		}
	}

	if (totalIssues === 0) {
		console.log("✅ All features have valid structure!");
	} else {
		console.log(`❌ Found ${totalIssues} structure issue(s)`);
		process.exit(1);
	}
};

main().catch(console.error);
