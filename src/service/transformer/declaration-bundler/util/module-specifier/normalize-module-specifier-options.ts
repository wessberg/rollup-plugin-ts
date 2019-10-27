import {SourceFile} from "typescript";
import {SupportedExtensions} from "../../../../../util/get-supported-extensions/get-supported-extensions";

export interface NormalizeModuleSpecifierOptions {
	specifier: string;
	sourceFile: SourceFile;
	supportedExtensions: SupportedExtensions;
	relativeOutFileName: string;
	absoluteOutFileName: string;
	chunkToOriginalFileMap: Map<string, string[]>;
}
