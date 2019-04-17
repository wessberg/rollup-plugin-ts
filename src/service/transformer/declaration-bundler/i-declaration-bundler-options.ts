import {OutputChunk} from "rollup";
import {SyntaxKind, TypeChecker} from "typescript";

export interface IDeclarationBundlerOptions {
	chunk: OutputChunk;
	usedExports: Set<string>;
	typeChecker: TypeChecker;
	supportedExtensions: string[];
	localModuleNames: string[];
	moduleNames: string[];
	relativeOutFileName: string;
	absoluteOutFileName: string;
	entryFileNames: string[];
	chunkToOriginalFileMap: Map<string, string[]>;
	identifiersForDefaultExportsForModules: Map<string, [string, SyntaxKind]>;
}
