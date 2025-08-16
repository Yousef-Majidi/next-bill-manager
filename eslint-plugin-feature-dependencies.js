// eslint plugin for feature dependency enforcement

const plugin = {
	meta: {
		name: "feature-dependencies",
		version: "1.0.0",
	},
	create(context) {
		const filename = context.getFilename();

		// only apply to feature files
		if (!filename.includes("/features/")) {
			return {};
		}

		// extract feature name from file path
		const getFeatureFromPath = (filePath) => {
			const featuresMatch = filePath.match(/\/features\/([^\/]+)/);
			return featuresMatch ? featuresMatch[1] : null;
		};

		const currentFeature = getFeatureFromPath(filename);

		if (!currentFeature) {
			return {};
		}

		return {
			ImportDeclaration: async (node) => {
				const importSource = node.source.value;

				// only check feature imports
				if (!importSource.startsWith("@/features/")) {
					return;
				}

				// extract target feature from import
				const targetFeatureMatch = importSource.match(/@\/features\/([^\/]+)/);
				if (!targetFeatureMatch) {
					return;
				}

				const targetFeature = targetFeatureMatch[1];

				// check for deep imports (importing from specific subdirectories)
				if (
					importSource.includes("/types/") ||
					importSource.includes("/components/") ||
					importSource.includes("/actions/") ||
					importSource.includes("/hooks/") ||
					importSource.includes("/utils/")
				) {
					context.report({
						node,
						message: `Deep import not allowed. Import from feature index instead: @/features/${targetFeature}`,
					});
					return;
				}

				// check dependency rules
				const { isImportAllowed } = await import(
					"./src/features/dependency-rules.ts"
				);

				if (!isImportAllowed(currentFeature, targetFeature)) {
					context.report({
						node,
						message: `Feature '${currentFeature}' cannot import from '${targetFeature}'. Check dependency rules.`,
					});
				}
			},
		};
	},
};

export default plugin;
