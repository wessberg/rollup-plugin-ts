export interface NormalizeModuleSpecifierResult {
	absoluteModuleSpecifier: string;
	normalizedModuleSpecifier: string;
	normalizedAbsoluteModuleSpecifier: string;
	isSameChunk: boolean;
	isExternal: boolean;
	hasChanged: boolean;
}
