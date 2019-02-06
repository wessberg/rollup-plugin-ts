import {RawSourceMap} from "rollup";

export interface MagicStringContainer {
	replaceAll(content: string, replacement: string): void;
	toString(): string;
	readonly code: string;
	readonly map: RawSourceMap;
	readonly hasModified: boolean;
}
