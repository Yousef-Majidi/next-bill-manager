/**
 * @see https://prettier.io/docs/configuration
 * @type {import("prettier").Config}
 */
const prettierConfig = {
	semi: true,
	singleQuote: false,
	useTabs: true,
	tabWidth: 2,
	printWidth: 80,
	trailingComma: "all",
	jsxSingleQuote: false,
	bracketSameLine: true,
	endOfLine: "auto",
	importOrder: [
		"^(react|next?/?([a-zA-Z/]*))$",
		"<THIRD_PARTY_MODULES>",
		"^@/(.*)$",
		"^[./]",
	],
	importOrderSeparation: true,
	importOrderSortSpecifiers: true,
	plugins: [
		"@trivago/prettier-plugin-sort-imports",
		"prettier-plugin-tailwindcss",
	],
};

export default prettierConfig;
