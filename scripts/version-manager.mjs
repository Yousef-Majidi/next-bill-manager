#!/usr/bin/env node
import { execSync } from "child_process";
import { readFileSync, writeFileSync } from "fs";
import { join } from "path";

const packageJsonPath = join(process.cwd(), "package.json");

function getCurrentVersion() {
	const packageJson = JSON.parse(readFileSync(packageJsonPath, "utf8"));
	return packageJson.version;
}

function updateVersion(type) {
	const packageJson = JSON.parse(readFileSync(packageJsonPath, "utf8"));
	const [major, minor, patch] = packageJson.version.split(".").map(Number);

	let newVersion;
	switch (type) {
		case "major":
			newVersion = `${major + 1}.0.0`;
			break;
		case "minor":
			newVersion = `${major}.${minor + 1}.0`;
			break;
		case "patch":
			newVersion = `${major}.${minor}.${patch + 1}`;
			break;
		case "preview":
			newVersion = `${major}.${minor}.${patch + 1}-beta.1`;
			break;
		default:
			throw new Error(`Invalid version type: ${type}`);
	}

	packageJson.version = newVersion;
	writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + "\n");
	return newVersion;
}

function createGitTag(version, message) {
	try {
		execSync(`git add package.json`);
		execSync(`git commit -m "chore: bump version to ${version}"`);
		execSync(`git tag -a v${version} -m "${message}"`);
		console.log(`✅ Created tag v${version}`);
	} catch (error) {
		console.error("❌ Failed to create git tag:", error.message);
		process.exit(1);
	}
}

function pushChanges() {
	try {
		execSync("git push origin HEAD");
		execSync("git push --tags");
		console.log("✅ Pushed changes and tags to remote");
	} catch (error) {
		console.error("❌ Failed to push changes:", error.message);
		process.exit(1);
	}
}

function main() {
	const args = process.argv.slice(2);
	const type = args[0];

	if (!type || !["major", "minor", "patch", "preview"].includes(type)) {
		console.log(
			"Usage: node scripts/version-manager.mjs <major|minor|patch|preview>",
		);
		process.exit(1);
	}

	const currentVersion = getCurrentVersion();
	console.log(`Current version: ${currentVersion}`);

	const newVersion = updateVersion(type);
	console.log(`New version: ${newVersion}`);

	const messages = {
		major: `Breaking changes in v${newVersion}`,
		minor: `New features in v${newVersion}`,
		patch: `Bug fixes in v${newVersion}`,
		preview: `Preview release v${newVersion}`,
	};

	createGitTag(newVersion, messages[type]);

	if (type !== "preview") {
		pushChanges();
	}

	console.log(`🎉 Successfully updated to version ${newVersion}`);
}

main();
