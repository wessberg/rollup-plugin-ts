import {OutputChunk} from "rollup";

export interface IDeclarationBundlerOptions {
	chunk: OutputChunk;
	usedExports: Set<string>;
	supportedExtensions: string[];
	localModuleNames: string[];
	moduleNames: string[];
	relativeOutFileName: string;
	absoluteOutFileName: string;
	entryFileNames: string[];
	chunkToOriginalFileMap: Map<string, string[]>;
	identifiersForDefaultExportsForModules: Map<string, string>;
}
