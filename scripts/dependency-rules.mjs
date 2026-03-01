// dependency rules for feature modules (JavaScript version for scripts)
const FEATURE_DEPENDENCIES = {
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
};

const FEATURE_LEVELS = {
	// base features
	BASE: ["auth", "providers", "shared"],
	// level 1 features
	LEVEL_1: ["bills", "tenants"],
	// level 2 features
	LEVEL_2: ["email", "dashboard"],
};

// get feature level
const getFeatureLevel = (featureName) => {
	if (FEATURE_LEVELS.BASE.includes(featureName)) return "BASE";
	if (FEATURE_LEVELS.LEVEL_1.includes(featureName)) return "LEVEL_1";
	if (FEATURE_LEVELS.LEVEL_2.includes(featureName)) return "LEVEL_2";
	throw new Error(`Unknown feature: ${featureName}`);
};

// check if import is allowed
const isImportAllowed = (fromFeature, toFeature) => {
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
	const dependencies = FEATURE_DEPENDENCIES[fromFeature];
	if (dependencies && dependencies.includes(toFeature)) return true;

	return false;
};

// get allowed imports for a feature
const getAllowedImports = (featureName) => {
	const allowed = [];

	// self-import
	allowed.push(featureName);

	// dependencies
	const dependencies = FEATURE_DEPENDENCIES[featureName];
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

export {
	FEATURE_DEPENDENCIES,
	FEATURE_LEVELS,
	getFeatureLevel,
	isImportAllowed,
	getAllowedImports,
};
