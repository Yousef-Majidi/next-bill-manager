#!/usr/bin/env node
import fs from "fs";
import { glob } from "glob";

import { getAllowedImports, isImportAllowed } from "./dependency-rules.mjs";

// get all TypeScript files in features directory
const getFeatureFiles = async () => {
	const files = await glob("src/features/**/*.{ts,tsx}", {
		ignore: ["src/features/**/index.ts", "src/features/**/node_modules/**"],
	});
	return files;
};

// extract imports from a file
const extractImports = (content) => {
	const importRegex = /import\s+.*?\s+from\s+['"]([^'"]+)['"]/g;
	const imports = [];
	let match;

	while ((match = importRegex.exec(content)) !== null) {
		imports.push(match[1]);
	}

	return imports;
};

// get feature name from file path
const getFeatureFromPath = (filePath) => {
	const featuresMatch = filePath.match(/\/features\/([^\/]+)/);
	return featuresMatch ? featuresMatch[1] : null;
};

// check dependencies for a single file
const checkFileDependencies = (filePath, content) => {
	const currentFeature = getFeatureFromPath(filePath);
	if (!currentFeature) return [];

	const imports = extractImports(content);
	const violations = [];

	imports.forEach((importPath) => {
		// only check feature imports
		if (!importPath.startsWith("@/features/")) return;

		// extract target feature
		const targetFeatureMatch = importPath.match(/@\/features\/([^\/]+)/);
		if (!targetFeatureMatch) return;

		const targetFeature = targetFeatureMatch[1];

		// check for deep imports
		if (
			importPath.includes("/types/") ||
			importPath.includes("/components/") ||
			importPath.includes("/actions/") ||
			importPath.includes("/hooks/") ||
			importPath.includes("/utils/")
		) {
			violations.push({
				type: "deep-import",
				message: `Deep import not allowed: ${importPath}`,
				suggestion: `Import from feature index instead: @/features/${targetFeature}`,
			});
			return;
		}

		// check dependency rules
		if (!isImportAllowed(currentFeature, targetFeature)) {
			violations.push({
				type: "invalid-dependency",
				message: `Feature '${currentFeature}' cannot import from '${targetFeature}'`,
				suggestion: `Allowed imports: ${getAllowedImports(currentFeature).join(", ")}`,
			});
		}
	});

	return violations.map((violation) => ({
		file: filePath,
		feature: currentFeature,
		...violation,
	}));
};

// main function
const main = async () => {
	console.log("🔍 Checking feature dependencies...\n");

	const files = await getFeatureFiles();
	let totalViolations = 0;

	for (const file of files) {
		const content = fs.readFileSync(file, "utf-8");
		const violations = checkFileDependencies(file, content);

		if (violations.length > 0) {
			console.log(`❌ ${file}:`);
			violations.forEach((violation) => {
				console.log(`   ${violation.type}: ${violation.message}`);
				console.log(`   💡 ${violation.suggestion}`);
				console.log("");
			});
			totalViolations += violations.length;
		}
	}

	if (totalViolations === 0) {
		console.log("✅ All feature dependencies are valid!");
	} else {
		console.log(`❌ Found ${totalViolations} dependency violation(s)`);
		process.exit(1);
	}
};

main().catch(console.error);
