// TypeScript declarations for dependency rules
export declare const FEATURE_DEPENDENCIES: {
	readonly auth: readonly [];
	readonly providers: readonly [];
	readonly shared: readonly [];
	readonly bills: readonly ["providers"];
	readonly tenants: readonly ["providers"];
	readonly email: readonly ["bills", "providers"];
	readonly dashboard: readonly ["bills", "tenants", "providers"];
};

export declare const FEATURE_LEVELS: {
	readonly BASE: readonly ["auth", "providers", "shared"];
	readonly LEVEL_1: readonly ["bills", "tenants"];
	readonly LEVEL_2: readonly ["email", "dashboard"];
};

export declare function getFeatureLevel(
	featureName: string,
): "BASE" | "LEVEL_1" | "LEVEL_2";

export declare function isImportAllowed(
	fromFeature: string,
	toFeature: string,
): boolean;

export declare function getAllowedImports(featureName: string): string[];
