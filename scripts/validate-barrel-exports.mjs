#!/usr/bin/env node
import fs from "fs";
import { glob } from "glob";
import path from "path";

// validate barrel exports in a directory
const validateBarrelExports = (dirPath) => {
	const indexPath = path.join(dirPath, "index.ts");
	if (!fs.existsSync(indexPath)) {
		return { valid: false, issues: ["Missing index.ts file"] };
	}

	const content = fs.readFileSync(indexPath, "utf-8");
	const issues = [];

	// check for export statements
	const exportRegex = /export\s+\*\s+from\s+['"]([^'"]+)['"]/g;
	const exports = [];
	let match;

	while ((match = exportRegex.exec(content)) !== null) {
		exports.push(match[1]);
	}

	// check if exports point to valid files/directories
	exports.forEach((exportPath) => {
		const fullPath = path.resolve(dirPath, exportPath);

		// handle relative imports
		if (exportPath.startsWith("./") || exportPath.startsWith("../")) {
			// check for both .ts and .js extensions, or just the directory
			const possiblePaths = [
				fullPath,
				`${fullPath}.ts`,
				`${fullPath}.js`,
				`${fullPath}/index.ts`,
				`${fullPath}/index.js`,
			];

			const exists = possiblePaths.some((p) => fs.existsSync(p));
			if (!exists) {
				issues.push(`Export points to non-existent path: ${exportPath}`);
			}
		}
	});

	// check for empty barrel exports (should have at least export {})
	if (exports.length === 0 && !content.includes("export {}")) {
		issues.push("Empty barrel export (should have at least 'export {}')");
	}

	return {
		valid: issues.length === 0,
		issues,
		exports,
	};
};

// main function
const main = async () => {
	console.log("🔍 Validating barrel exports...\n");

	// check feature index files
	const featureIndexFiles = await glob("src/features/*/index.ts");
	let totalIssues = 0;

	for (const indexFile of featureIndexFiles) {
		const featureName = path.basename(path.dirname(indexFile));
		const result = validateBarrelExports(path.dirname(indexFile));

		if (!result.valid) {
			console.log(`❌ ${featureName}:`);
			result.issues.forEach((issue) => {
				console.log(`   ${issue}`);
			});
			console.log("");
			totalIssues += result.issues.length;
		} else {
			console.log(
				`✅ ${featureName}: Valid barrel exports (${result.exports.length} exports)`,
			);
		}
	}

	// check subdirectory index files
	const subIndexFiles = await glob("src/features/*/*/index.ts");

	for (const indexFile of subIndexFiles) {
		const dirPath = path.dirname(indexFile);
		const featureName = path.basename(path.dirname(dirPath));
		const subDirName = path.basename(dirPath);
		const result = validateBarrelExports(dirPath);

		if (!result.valid) {
			console.log(`❌ ${featureName}/${subDirName}:`);
			result.issues.forEach((issue) => {
				console.log(`   ${issue}`);
			});
			console.log("");
			totalIssues += result.issues.length;
		}
	}

	if (totalIssues === 0) {
		console.log("✅ All barrel exports are valid!");
	} else {
		console.log(`❌ Found ${totalIssues} barrel export issue(s)`);
		process.exit(1);
	}
};

main().catch(console.error);
