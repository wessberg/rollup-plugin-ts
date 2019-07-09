import {SourceMap} from "rollup";

export interface MagicStringContainer {
	readonly code: string;
	readonly map: SourceMap;
	readonly hasModified: boolean;
	replaceAll(content: string, replacement: string): void;
	toString(): string;
}
