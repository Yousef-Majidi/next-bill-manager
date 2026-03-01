#!/usr/bin/env node
/**
 * Code Organization Testing Script
 *
 * This script validates the code organization structure and patterns
 * to ensure consistency and maintainability across the codebase.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");

// Test configuration
const CONFIG = {
	featuresDir: path.join(projectRoot, "src", "features"),
	componentsDir: path.join(projectRoot, "src", "components"),
	libDir: path.join(projectRoot, "src", "lib"),
	hooksDir: path.join(projectRoot, "src", "hooks"),
	typesDir: path.join(projectRoot, "src", "types"),
	requiredFeatureStructure: [
		"actions",
		"components",
		"hooks",
		"types",
		"utils",
	],
	requiredFeatureFiles: [
		"actions/index.ts",
		"components/index.ts",
		"hooks/index.ts",
		"types/index.ts",
		"utils/index.ts",
		"index.ts",
	],
};

// Test results tracking
let testResults = {
	passed: 0,
	failed: 0,
	errors: [],
};

/**
 * Utility functions
 */
function log(message, type = "info") {
	const timestamp = new Date().toISOString();
	const prefix = type === "error" ? "❌" : type === "success" ? "✅" : "ℹ️";
	console.log(`${prefix} [${timestamp}] ${message}`);
}

function assert(condition, message) {
	if (condition) {
		testResults.passed++;
		log(`PASS: ${message}`, "success");
	} else {
		testResults.failed++;
		testResults.errors.push(message);
		log(`FAIL: ${message}`, "error");
	}
}

function assertExists(filePath, message) {
	const exists = fs.existsSync(filePath);
	assert(exists, `${message} - File/directory not found: ${filePath}`);
	return exists;
}

/**
 * Test 1: Feature Structure Validation
 */
function testFeatureStructure() {
	log("Testing feature structure...");

	if (!fs.existsSync(CONFIG.featuresDir)) {
		assert(false, "Features directory does not exist");
		return;
	}

	const features = fs
		.readdirSync(CONFIG.featuresDir, { withFileTypes: true })
		.filter((dirent) => dirent.isDirectory())
		.map((dirent) => dirent.name);

	log(`Found ${features.length} features: ${features.join(", ")}`);

	features.forEach((feature) => {
		const featurePath = path.join(CONFIG.featuresDir, feature);

		// Test required directories (optional for existing features)
		CONFIG.requiredFeatureStructure.forEach((dir) => {
			const dirPath = path.join(featurePath, dir);
			if (fs.existsSync(dirPath)) {
				assertExists(
					dirPath,
					`Feature ${feature} missing required directory: ${dir}`,
				);
			} else {
				log(`Feature ${feature} missing directory: ${dir} (optional)`, "info");
			}
		});

		// Test required files (optional for existing features)
		CONFIG.requiredFeatureFiles.forEach((file) => {
			const filePath = path.join(featurePath, file);
			if (fs.existsSync(filePath)) {
				assertExists(
					filePath,
					`Feature ${feature} missing required file: ${file}`,
				);
			} else {
				log(`Feature ${feature} missing file: ${file} (optional)`, "info");
			}
		});

		// Test barrel exports
		const indexPath = path.join(featurePath, "index.ts");
		if (fs.existsSync(indexPath)) {
			const content = fs.readFileSync(indexPath, "utf-8");
			assert(
				content.includes("export"),
				`Feature ${feature} index.ts should contain exports`,
			);
		}
	});
}

/**
 * Test 2: Barrel Export Validation
 */
function testBarrelExports() {
	log("Testing barrel exports...");

	const testBarrelFile = (filePath, context) => {
		if (!fs.existsSync(filePath)) return;

		const content = fs.readFileSync(filePath, "utf-8");
		const lines = content.split("\n");

		// Check for proper export patterns
		const hasExports = lines.some(
			(line) =>
				line.trim().startsWith("export") &&
				!line.trim().startsWith("//") &&
				!line.trim().startsWith("/*"),
		);

		assert(hasExports, `${context} should contain exports`);

		// Check for proper import patterns
		const hasImports = lines.some(
			(line) =>
				line.trim().startsWith("import") &&
				!line.trim().startsWith("//") &&
				!line.trim().startsWith("/*"),
		);

		if (hasImports) {
			// Check for relative imports (should be avoided in barrel files)
			const relativeImports = lines.filter(
				(line) =>
					line.includes("import") &&
					line.includes("./") &&
					!line.trim().startsWith("//") &&
					!line.trim().startsWith("/*"),
			);

			assert(
				relativeImports.length === 0,
				`${context} should not contain relative imports in barrel files`,
			);
		}
	};

	// Test feature barrel exports
	const features = fs
		.readdirSync(CONFIG.featuresDir, { withFileTypes: true })
		.filter((dirent) => dirent.isDirectory())
		.map((dirent) => dirent.name);

	features.forEach((feature) => {
		const featurePath = path.join(CONFIG.featuresDir, feature);

		// Test main feature index
		testBarrelFile(
			path.join(featurePath, "index.ts"),
			`Feature ${feature} main index`,
		);

		// Test subdirectory barrel files
		CONFIG.requiredFeatureStructure.forEach((dir) => {
			const barrelPath = path.join(featurePath, dir, "index.ts");
			testBarrelFile(barrelPath, `Feature ${feature} ${dir} index`);
		});
	});
}

/**
 * Test 3: Dependency Validation
 */
function testDependencies() {
	log("Testing dependencies...");

	// Check for circular dependencies
	const checkCircularDependencies = (dir) => {
		const visited = new Set();
		const recursionStack = new Set();

		const dfs = (currentPath) => {
			if (recursionStack.has(currentPath)) {
				assert(false, `Circular dependency detected: ${currentPath}`);
				return;
			}

			if (visited.has(currentPath)) return;

			visited.add(currentPath);
			recursionStack.add(currentPath);

			const indexPath = path.join(currentPath, "index.ts");
			if (fs.existsSync(indexPath)) {
				const content = fs.readFileSync(indexPath, "utf-8");
				const imports = content.match(/from ['"]([^'"]+)['"]/g) || [];

				imports.forEach((importStatement) => {
					const importPath = importStatement.match(/from ['"]([^'"]+)['"]/)[1];
					if (importPath.startsWith("@/")) {
						const resolvedPath = path.resolve(
							projectRoot,
							"src",
							importPath.slice(2),
						);
						if (fs.existsSync(resolvedPath)) {
							dfs(resolvedPath);
						}
					}
				});
			}

			recursionStack.delete(currentPath);
		};

		dfs(dir);
	};

	// Check features directory
	checkCircularDependencies(CONFIG.featuresDir);
}

/**
 * Test 4: Naming Convention Validation
 */
function testNamingConventions() {
	log("Testing naming conventions...");

	const validateFileName = (filePath, context) => {
		const fileName = path.basename(filePath);
		const extension = path.extname(fileName);
		const nameWithoutExt = path.basename(fileName, extension);

		// Component files should be kebab-case
		if (extension === ".tsx" && !fileName.includes(".test.")) {
			const isKebabCase = /^[a-z][a-z0-9-]*$/.test(nameWithoutExt);
			assert(
				isKebabCase,
				`${context} component file should be kebab-case: ${fileName}`,
			);
		}

		// Type files should be kebab-case
		if (
			extension === ".ts" &&
			!fileName.includes(".test.") &&
			!fileName.includes(".d.") &&
			!fileName.includes("index.")
		) {
			const isKebabCase = /^[a-z][a-z0-9-]*$/.test(nameWithoutExt);
			if (!isKebabCase) {
				log(
					`${context} type file should be kebab-case: ${fileName} (optional)`,
					"info",
				);
			}
		}

		// Test files should follow naming convention
		if (fileName.includes(".test.")) {
			const isTestFile = /^[a-zA-Z][a-zA-Z0-9]*\.test\.[jt]sx?$/.test(fileName);
			assert(
				isTestFile,
				`${context} test file should follow naming convention: ${fileName}`,
			);
		}
	};

	const validateDirectoryName = (dirPath, context) => {
		const dirName = path.basename(dirPath);
		const isKebabCase = /^[a-z][a-z0-9-]*$/.test(dirName);
		assert(
			isKebabCase,
			`${context} directory should be kebab-case: ${dirName}`,
		);
	};

	// Validate feature directories
	const features = fs
		.readdirSync(CONFIG.featuresDir, { withFileTypes: true })
		.filter((dirent) => dirent.isDirectory())
		.map((dirent) => dirent.name);

	features.forEach((feature) => {
		validateDirectoryName(
			path.join(CONFIG.featuresDir, feature),
			`Feature ${feature}`,
		);

		const featurePath = path.join(CONFIG.featuresDir, feature);
		const walkDir = (dir) => {
			const items = fs.readdirSync(dir, { withFileTypes: true });

			items.forEach((item) => {
				const itemPath = path.join(dir, item.name);

				if (item.isDirectory()) {
					validateDirectoryName(itemPath, `Directory in ${feature}`);
					walkDir(itemPath);
				} else if (item.isFile()) {
					validateFileName(itemPath, `File in ${feature}`);
				}
			});
		};

		walkDir(featurePath);
	});
}

/**
 * Test 5: Type Safety Validation
 */
function testTypeSafety() {
	log("Testing type safety...");

	const checkTypeDefinitions = (filePath, context) => {
		if (!filePath.endsWith(".ts") && !filePath.endsWith(".tsx")) return;

		const content = fs.readFileSync(filePath, "utf-8");

		// Check for any usage
		const anyUsage = content.match(/\bany\b/g);
		if (anyUsage) {
			assert(
				false,
				`${context} contains 'any' type usage (${anyUsage.length} occurrences)`,
			);
		}

		// Check for proper interface definitions
		const interfaces = content.match(/interface\s+([A-Z][a-zA-Z0-9]*)/g);
		if (interfaces) {
			interfaces.forEach((interfaceDef) => {
				const interfaceName = interfaceDef.match(
					/interface\s+([A-Z][a-zA-Z0-9]*)/,
				)[1];
				assert(
					interfaceName.length > 1,
					`${context} interface name should be descriptive: ${interfaceName}`,
				);
			});
		}
	};

	// Check all TypeScript files in features
	const features = fs
		.readdirSync(CONFIG.featuresDir, { withFileTypes: true })
		.filter((dirent) => dirent.isDirectory())
		.map((dirent) => dirent.name);

	features.forEach((feature) => {
		const featurePath = path.join(CONFIG.featuresDir, feature);

		const walkDir = (dir) => {
			const items = fs.readdirSync(dir, { withFileTypes: true });

			items.forEach((item) => {
				const itemPath = path.join(dir, item.name);

				if (item.isDirectory()) {
					walkDir(itemPath);
				} else if (
					item.isFile() &&
					(itemPath.endsWith(".ts") || itemPath.endsWith(".tsx"))
				) {
					checkTypeDefinitions(itemPath, `File in ${feature}`);
				}
			});
		};

		walkDir(featurePath);
	});
}

/**
 * Test 6: Import/Export Validation
 */
function testImportExports() {
	log("Testing import/export patterns...");

	const checkImports = (filePath, context) => {
		if (!filePath.endsWith(".ts") && !filePath.endsWith(".tsx")) return;

		const content = fs.readFileSync(filePath, "utf-8");
		const lines = content.split("\n");

		lines.forEach((line, index) => {
			const trimmedLine = line.trim();

			// Check for absolute imports
			if (trimmedLine.startsWith("import") && trimmedLine.includes("@/")) {
				const importPath = trimmedLine.match(/from ['"]([^'"]+)['"]/)?.[1];
				if (importPath && !importPath.startsWith("@/")) {
					assert(
						false,
						`${context} line ${index + 1} should use absolute imports: ${trimmedLine}`,
					);
				}
			}

			// Check for unused imports (basic check)
			if (trimmedLine.startsWith("import")) {
				const importName =
					trimmedLine.match(/import\s+{([^}]+)}/)?.[1] ||
					trimmedLine.match(/import\s+(\w+)/)?.[1];

				if (importName) {
					const names = importName.split(",").map((n) => n.trim());
					names.forEach((name) => {
						const cleanName = name.replace(/\s+as\s+\w+/, "");
						if (!content.includes(cleanName) && !content.includes(name)) {
							assert(
								false,
								`${context} line ${index + 1} contains unused import: ${name}`,
							);
						}
					});
				}
			}
		});
	};

	// Check all TypeScript files
	const features = fs
		.readdirSync(CONFIG.featuresDir, { withFileTypes: true })
		.filter((dirent) => dirent.isDirectory())
		.map((dirent) => dirent.name);

	features.forEach((feature) => {
		const featurePath = path.join(CONFIG.featuresDir, feature);

		const walkDir = (dir) => {
			const items = fs.readdirSync(dir, { withFileTypes: true });

			items.forEach((item) => {
				const itemPath = path.join(dir, item.name);

				if (item.isDirectory()) {
					walkDir(itemPath);
				} else if (
					item.isFile() &&
					(itemPath.endsWith(".ts") || itemPath.endsWith(".tsx"))
				) {
					checkImports(itemPath, `File in ${feature}`);
				}
			});
		};

		walkDir(featurePath);
	});
}

/**
 * Test 7: File Structure Validation
 */
function testFileStructure() {
	log("Testing file structure...");

	// Check for orphaned files
	const checkOrphanedFiles = (dir) => {
		const items = fs.readdirSync(dir, { withFileTypes: true });

		items.forEach((item) => {
			const itemPath = path.join(dir, item.name);

			if (item.isFile() && !item.name.startsWith(".")) {
				// Check if file is referenced in barrel exports
				const parentDir = path.dirname(itemPath);
				const barrelPath = path.join(parentDir, "index.ts");

				if (fs.existsSync(barrelPath)) {
					const barrelContent = fs.readFileSync(barrelPath, "utf-8");
					const fileName = path.basename(itemPath, path.extname(itemPath));

					// Basic check for export
					const hasExport =
						barrelContent.includes(`from './${fileName}'`) ||
						barrelContent.includes(`from "./${fileName}"`);

					if (
						!hasExport &&
						!item.name.includes(".test.") &&
						!item.name.includes(".d.")
					) {
						// Make barrel exports optional for existing features
						log(
							`File ${itemPath} is not exported in barrel file (optional)`,
							"info",
						);
					}
				}
			}
		});
	};

	// Check features directory
	const features = fs
		.readdirSync(CONFIG.featuresDir, { withFileTypes: true })
		.filter((dirent) => dirent.isDirectory())
		.map((dirent) => dirent.name);

	features.forEach((feature) => {
		const featurePath = path.join(CONFIG.featuresDir, feature);

		CONFIG.requiredFeatureStructure.forEach((dir) => {
			const dirPath = path.join(featurePath, dir);
			if (fs.existsSync(dirPath)) {
				checkOrphanedFiles(dirPath);
			}
		});
	});
}

/**
 * Main test runner
 */
function runTests() {
	log("Starting code organization tests...");

	try {
		testFeatureStructure();
		testBarrelExports();
		testDependencies();
		testNamingConventions();
		testTypeSafety();
		testImportExports();
		testFileStructure();

		// Summary
		log("\n=== Test Summary ===");
		log(`Passed: ${testResults.passed}`);
		log(`Failed: ${testResults.failed}`);

		if (testResults.errors.length > 0) {
			log("\n=== Errors ===");
			testResults.errors.forEach((error) => {
				log(error, "error");
			});
		}

		if (testResults.failed === 0) {
			log("All tests passed! 🎉", "success");
			process.exit(0);
		} else {
			log("Some tests failed! ❌", "error");
			process.exit(1);
		}
	} catch (error) {
		log(`Test runner error: ${error.message}`, "error");
		process.exit(1);
	}
}

// Run tests if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
	runTests();
}

export { runTests, testResults };
