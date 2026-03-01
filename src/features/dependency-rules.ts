// dependency rules for feature modules
export const FEATURE_DEPENDENCIES = {
	// base features (no dependencies)
	auth: [],
	providers: [],
	shared: [],

	// level 1 features (depend on base features)
	bills: ["providers"],
	tenants: ["providers"],

	// level 2 features (depend on level 1 and base features)
	email: ["bills", "providers"],
	dashboard: ["bills", "tenants", "providers"],
} as const;

export const FEATURE_LEVELS = {
	// base features
	BASE: ["auth", "providers", "shared"],
	// level 1 features
	LEVEL_1: ["bills", "tenants"],
	// level 2 features
	LEVEL_2: ["email", "dashboard"],
} as const;

// allowed import patterns
export const ALLOWED_IMPORTS = {
	// features can import from their own feature
	SELF: true,
	// features can import from their dependencies
	DEPENDENCIES: true,
	// features can import from shared utilities
	SHARED_UTILS: true,
	// features can import from external libraries
	EXTERNAL: true,
} as const;

// forbidden import patterns
export const FORBIDDEN_IMPORTS = {
	// features cannot import from features at the same level (unless they're dependencies)
	SAME_LEVEL: true,
	// features cannot import from features at higher levels
	HIGHER_LEVEL: true,
	// features cannot import from other features' internal files
	DEEP_IMPORTS: true,
} as const;

// get feature level
export const getFeatureLevel = (
	featureName: string,
): "BASE" | "LEVEL_1" | "LEVEL_2" => {
	if (
		FEATURE_LEVELS.BASE.includes(
			featureName as (typeof FEATURE_LEVELS.BASE)[number],
		)
	)
		return "BASE";
	if (
		FEATURE_LEVELS.LEVEL_1.includes(
			featureName as (typeof FEATURE_LEVELS.LEVEL_1)[number],
		)
	)
		return "LEVEL_1";
	if (
		FEATURE_LEVELS.LEVEL_2.includes(
			featureName as (typeof FEATURE_LEVELS.LEVEL_2)[number],
		)
	)
		return "LEVEL_2";
	throw new Error(`Unknown feature: ${featureName}`);
};

// check if import is allowed
export const isImportAllowed = (
	fromFeature: string,
	toFeature: string,
): boolean => {
	// self-import is always allowed
	if (fromFeature === toFeature) return true;

	// get feature levels
	const fromLevel = getFeatureLevel(fromFeature);
	const toLevel = getFeatureLevel(toFeature);

	// base features can import from any base feature
	if (fromLevel === "BASE" && toLevel === "BASE") return true;

	// level 1 features can import from base features
	if (fromLevel === "LEVEL_1" && toLevel === "BASE") return true;

	// level 2 features can import from base and level 1 features
	if (fromLevel === "LEVEL_2" && (toLevel === "BASE" || toLevel === "LEVEL_1"))
		return true;

	// check explicit dependencies
	const dependencies =
		FEATURE_DEPENDENCIES[fromFeature as keyof typeof FEATURE_DEPENDENCIES];
	if (dependencies && (dependencies as readonly string[]).includes(toFeature))
		return true;

	return false;
};

// get allowed imports for a feature
export const getAllowedImports = (featureName: string): string[] => {
	const allowed: string[] = [];

	// self-import
	allowed.push(featureName);

	// dependencies
	const dependencies =
		FEATURE_DEPENDENCIES[featureName as keyof typeof FEATURE_DEPENDENCIES];
	if (dependencies) {
		allowed.push(...dependencies);
	}

	// base features can import from other base features
	const featureLevel = getFeatureLevel(featureName);
	if (featureLevel === "BASE") {
		allowed.push(...FEATURE_LEVELS.BASE.filter((f) => f !== featureName));
	}

	return allowed;
};
