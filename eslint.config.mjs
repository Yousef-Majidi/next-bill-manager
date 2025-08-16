import { FlatCompat } from "@eslint/eslintrc";
import { dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
	baseDirectory: __dirname,
});

const eslintConfig = [
	...compat.extends("next/core-web-vitals", "next/typescript"),
	{
		files: ["src/features/**/*.{ts,tsx}"],
		rules: {
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
		},
	},
	{
		files: ["src/**/*.{ts,tsx}"],
		rules: {
			// enforce consistent exports
			"import/prefer-default-export": "off",
			"import/no-default-export": "off",
		},
	},
];

export default eslintConfig;
