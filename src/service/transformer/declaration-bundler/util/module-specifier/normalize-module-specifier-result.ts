export interface NormalizeModuleSpecifierResult {
	normalizedModuleSpecifier: string;
	normalizedAbsoluteModuleSpecifier: string;
	isSameChunk: boolean;
	hasChanged: boolean;
}
