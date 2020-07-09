import {TS} from "../../../../../type/ts";
import {DeclarationBundlerOptions} from "../../declaration-bundler-options";
import {LexicalEnvironment} from "../deconflicter/deconflicter-options";
import {ImportedSymbol} from "../track-imports-transformer/track-imports-transformer-visitor-options";

export type SourceFileResolver = (fileName: string, from: string) => TS.SourceFile | undefined;
export type CompatFactory = TS.NodeFactory | typeof TS;

export interface SourceFileBundlerVisitorOptions extends DeclarationBundlerOptions {
	factory: TS.NodeFactory | undefined;
	compatFactory: CompatFactory;
	resolveSourceFile: SourceFileResolver;
	context: TS.TransformationContext;
	sourceFile: TS.SourceFile;
	otherEntrySourceFilesForChunk: TS.SourceFile[];
	lexicalEnvironment: LexicalEnvironment;
	includedSourceFiles: Set<string>;

	// Declarations are represented by IDs which are mapped a string, indicating the deconflicted names for them
	declarationToDeconflictedBindingMap: Map<number, string>;
	preservedImports: Map<string, Set<ImportedSymbol>>;
}
