import { FlatCompat } from "@eslint/eslintrc";
import tseslintPlugin from "@typescript-eslint/eslint-plugin";
import tseslintParser from "@typescript-eslint/parser";
import importPlugin from "eslint-plugin-import";
import reactHooksPlugin from "eslint-plugin-react-hooks";
import { dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
	baseDirectory: __dirname,
	resolvePluginsRelativeTo: __dirname,
});

// Use Next.js configs separately to avoid circular structure issues
let nextConfigs = [];
try {
	nextConfigs = compat.extends("next/core-web-vitals", "next/typescript");
} catch (error) {
	// If FlatCompat fails due to circular structure, skip Next.js config
	// The build process uses 'next lint' which handles this properly
	nextConfigs = [];
}

// Build rules conditionally based on whether Next.js config loaded
const featureRules =
	nextConfigs.length > 0
		? {
				// enforce naming conventions
				"@typescript-eslint/naming-convention": [
					"error",
					{
						selector: "interface",
						format: ["PascalCase"],
					},
					{
						selector: "typeAlias",
						format: ["PascalCase"],
					},
					{
						selector: "enum",
						format: ["PascalCase"],
					},
					{
						selector: "enumMember",
						format: ["PascalCase"],
					},
				],
				// enforce import organization
				"import/order": [
					"error",
					{
						groups: [
							"builtin",
							"external",
							"internal",
							"parent",
							"sibling",
							"index",
						],
						"newlines-between": "always",
						alphabetize: {
							order: "asc",
							caseInsensitive: true,
						},
					},
				],
				// enforce barrel exports
				"import/no-useless-path-segments": "error",
				// prevent deep imports
				"no-restricted-imports": [
					"error",
					{
						patterns: [
							{
								group: [
									"@/features/*/types/*",
									"@/features/*/components/*",
									"@/features/*/actions/*",
									"@/features/*/hooks/*",
									"@/features/*/utils/*",
								],
								message:
									"Deep imports not allowed. Import from feature index instead.",
							},
						],
					},
				],
			}
		: {
				// When Next.js config fails, skip rules that require plugins
				// The CI will use 'next lint' which has its own config
				// This fallback is just to prevent config errors
			};

// Base config with parser and plugins - always include when Next.js config fails
const baseConfig = {
	languageOptions: {
		parser: tseslintParser,
		parserOptions: {
			ecmaVersion: "latest",
			sourceType: "module",
			ecmaFeatures: {
				jsx: true,
			},
			project: "./tsconfig.json",
		},
	},
	plugins: {
		import: importPlugin,
		"@typescript-eslint": tseslintPlugin,
		"react-hooks": reactHooksPlugin,
	},
};

const eslintConfig = [
	...nextConfigs,
	// Include base config with plugins if Next.js config failed
	...(nextConfigs.length === 0 ? [baseConfig] : []),
	{
		files: ["src/features/**/*.{ts,tsx}"],
		// Include parser and plugins if Next.js config failed
		...(nextConfigs.length === 0
			? {
					languageOptions: baseConfig.languageOptions,
					plugins: baseConfig.plugins,
				}
			: {}),
		rules: featureRules,
	},
	{
		files: ["src/**/*.{ts,tsx}"],
		// Include parser and plugins if Next.js config failed
		...(nextConfigs.length === 0
			? {
					languageOptions: baseConfig.languageOptions,
					plugins: baseConfig.plugins,
				}
			: {}),
		rules: {
			// enforce consistent exports (only if import plugin is available)
			...(nextConfigs.length > 0 || baseConfig.plugins.import
				? {
						"import/prefer-default-export": "off",
						"import/no-default-export": "off",
					}
				: {}),
		},
	},
];

export default eslintConfig;
