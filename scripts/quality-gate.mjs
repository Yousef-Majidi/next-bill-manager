#!/usr/bin/env node
/**
 * Quality Gate Script
 *
 * This script enforces quality standards before deployment:
 * - Code coverage thresholds
 * - Linting standards
 * - Type checking
 * - Build validation
 * - Security checks
 */
import { execSync } from "child_process";
import { existsSync, readFileSync } from "fs";
import { join } from "path";

const QUALITY_THRESHOLDS = {
	coverage: {
		statements: 70,
		branches: 70,
		functions: 70,
		lines: 70,
	},
	lintErrors: 0,
	typeErrors: 0,
	buildErrors: 0,
	securityVulnerabilities: 0,
};

class QualityGate {
	constructor() {
		this.errors = [];
		this.warnings = [];
	}

	log(message, type = "info") {
		const timestamp = new Date().toISOString();
		const prefix = type === "error" ? "❌" : type === "warning" ? "⚠️" : "✅";
		console.log(`${prefix} [${timestamp}] ${message}`);
	}

	runCommand(command, description) {
		try {
			this.log(`Running: ${description}`);
			const result = execSync(command, {
				encoding: "utf8",
				stdio: "pipe",
			});
			this.log(`✅ ${description} passed`);
			return { success: true, output: result };
		} catch (error) {
			this.log(`❌ ${description} failed: ${error.message}`, "error");
			this.errors.push(`${description}: ${error.message}`);
			return {
				success: false,
				output: error.stdout || error.stderr || error.message,
			};
		}
	}

	checkCoverage() {
		this.log("Checking code coverage...");

		// First run coverage if it doesn't exist
		const coverageFile = join(process.cwd(), "coverage", "coverage-final.json");
		if (!existsSync(coverageFile)) {
			this.log("Running coverage first...");
			const coverageResult = this.runCommand(
				"pnpm run test:coverage:check",
				"Coverage generation",
			);
			if (!coverageResult.success) {
				return false;
			}
		}

		try {
			const coverage = JSON.parse(readFileSync(coverageFile, "utf8"));

			// Calculate totals from individual file data
			let totalStatements = 0;
			let totalBranches = 0;
			let totalFunctions = 0;
			let totalLines = 0;
			let coveredStatements = 0;
			let coveredBranches = 0;
			let coveredFunctions = 0;
			let coveredLines = 0;

			Object.values(coverage).forEach((fileData) => {
				if (fileData.s) {
					totalStatements += Object.keys(fileData.s).length;
					coveredStatements += Object.values(fileData.s).filter(
						(count) => count > 0,
					).length;
				}
				if (fileData.b) {
					totalBranches += Object.keys(fileData.b).length;
					coveredBranches += Object.values(fileData.b).filter((counts) =>
						counts.some((count) => count > 0),
					).length;
				}
				if (fileData.f) {
					totalFunctions += Object.keys(fileData.f).length;
					coveredFunctions += Object.values(fileData.f).filter(
						(count) => count > 0,
					).length;
				}
				if (fileData.l) {
					totalLines += Object.keys(fileData.l).length;
					coveredLines += Object.values(fileData.l).filter(
						(count) => count > 0,
					).length;
				}
			});

			const totals = {
				statements: {
					pct:
						totalStatements > 0
							? (coveredStatements / totalStatements) * 100
							: 0,
				},
				branches: {
					pct: totalBranches > 0 ? (coveredBranches / totalBranches) * 100 : 0,
				},
				functions: {
					pct:
						totalFunctions > 0 ? (coveredFunctions / totalFunctions) * 100 : 0,
				},
				lines: { pct: totalLines > 0 ? (coveredLines / totalLines) * 100 : 0 },
			};

			let passed = true;
			Object.entries(QUALITY_THRESHOLDS.coverage).forEach(
				([metric, threshold]) => {
					const actual = totals[metric].pct;
					if (actual < threshold) {
						this.log(
							`❌ Coverage ${metric}: ${actual.toFixed(1)}% < ${threshold}%`,
							"error",
						);
						this.errors.push(
							`Coverage ${metric} below threshold: ${actual.toFixed(1)}% < ${threshold}%`,
						);
						passed = false;
					} else {
						this.log(
							`✅ Coverage ${metric}: ${actual.toFixed(1)}% >= ${threshold}%`,
						);
					}
				},
			);

			return passed;
		} catch (error) {
			this.log(`❌ Error reading coverage file: ${error.message}`, "error");
			this.errors.push(`Coverage file error: ${error.message}`);
			return false;
		}
	}

	checkLinting() {
		this.log("Checking code linting...");
		const result = this.runCommand("pnpm run lint", "Linting check");
		return result.success;
	}

	checkTypes() {
		this.log("Checking TypeScript types...");
		const result = this.runCommand("pnpm run build", "Type checking");
		return result.success;
	}

	checkSecurity() {
		this.log("Checking security vulnerabilities...");
		const result = this.runCommand(
			"pnpm audit --audit-level moderate",
			"Security audit",
		);
		return result.success;
	}

	checkDependencies() {
		this.log("Checking dependency validation...");
		const result = this.runCommand(
			"pnpm run check-dependencies",
			"Dependency validation",
		);
		return result.success;
	}

	checkCodeStructure() {
		this.log("Checking code structure...");
		const result = this.runCommand(
			"pnpm run validate-all",
			"Code structure validation",
		);
		return result.success;
	}

	async run() {
		this.log("🚀 Starting Quality Gate Checks...");
		this.log("");

		const checks = [
			{ name: "Code Structure", fn: () => this.checkCodeStructure() },
			{ name: "Linting", fn: () => this.checkLinting() },
			{ name: "Type Checking", fn: () => this.checkTypes() },
			{ name: "Security", fn: () => this.checkSecurity() },
			{ name: "Dependencies", fn: () => this.checkDependencies() },
			{ name: "Coverage", fn: () => this.checkCoverage() },
		];

		// Check for CI mode flag
		const isCIMode = process.argv.includes("--ci");
		if (isCIMode) {
			this.log("🔧 Running in CI mode - skipping coverage checks");
			checks.splice(
				checks.findIndex((check) => check.name === "Coverage"),
				1,
			);
		}

		for (const check of checks) {
			check.fn();
			this.log("");
		}

		// Summary
		this.log("📊 Quality Gate Summary:");
		this.log("");

		if (this.errors.length > 0) {
			this.log("❌ Quality Gate FAILED", "error");
			this.log("");
			this.log("Errors found:");
			this.errors.forEach((error, index) => {
				this.log(`  ${index + 1}. ${error}`, "error");
			});
			this.log("");
			process.exit(1);
		} else {
			this.log("✅ Quality Gate PASSED");
			this.log("");
			this.log("All quality checks passed successfully!");
			this.log("Ready for deployment. 🚀");
		}
	}
}

// Run quality gate if this script is executed directly
const qualityGate = new QualityGate();
qualityGate.run().catch((error) => {
	console.error("❌ Quality Gate failed with error:", error);
	process.exit(1);
});

export default QualityGate;
