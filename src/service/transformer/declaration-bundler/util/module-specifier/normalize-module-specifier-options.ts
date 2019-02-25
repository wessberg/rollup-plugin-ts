import {SourceFile} from "typescript";

export interface NormalizeModuleSpecifierOptions {
	specifier: string;
	sourceFile: SourceFile;
	supportedExtensions: string[];
	relativeOutFileName: string;
	absoluteOutFileName: string;
	chunkToOriginalFileMap: Map<string, string[]>;
}
