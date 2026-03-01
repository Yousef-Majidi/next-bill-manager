import react from "@vitejs/plugin-react";
import path from "path";
import { defineConfig } from "vitest/config";

export default defineConfig({
	plugins: [react()],
	test: {
		environment: "jsdom",
		setupFiles: ["./src/test/setup.tsx"],
		globals: true,
		css: true,
		include: [
			"src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}",
			"src/test/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}",
		],
		coverage: {
			provider: "v8",
			reporter: ["text", "json", "html"],
			exclude: [
				"node_modules/",
				"src/test/",
				".next/",
				"**/*.d.ts",
				"**/*.config.*",
				"**/*.setup.*",
				"src/types/",
				"src/lib/common/error-handling.ts",
				"src/lib/common/type-utils.ts",
			],
			thresholds: {
				global: {
					branches: 70,
					functions: 70,
					lines: 70,
					statements: 70,
				},
			},
		},
	},
	resolve: {
		alias: {
			"@": path.resolve(__dirname, "./src"),
		},
	},
});
