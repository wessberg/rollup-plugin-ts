import {TypeChecker} from "typescript";

export interface IDeclarationTransformersOptions {
	usedExports: Set<string>;
	supportedExtensions: string[];
	localModuleNames: string[];
	moduleNames: string[];
	entryFileName: string;
	outFileName: string;
	typeChecker: TypeChecker;
	chunkToOriginalFileMap: Map<string, string[]>;
	fileToRewrittenIncludedExportModuleSpecifiersMap: Map<string, Set<string>>;
}
