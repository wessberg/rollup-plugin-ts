import {TS} from "../../../../../type/ts";
import {DeclarationBundlerOptions} from "../../declaration-bundler-options";
import {LexicalEnvironment} from "../deconflicter/deconflicter-options";
import {ImportedSymbol} from "../track-imports-transformer/track-imports-transformer-visitor-options";
import {TransformerBaseOptions} from "../transformer-base-options";

export type SourceFileResolver = (fileName: string, from: string) => TS.SourceFile | undefined;

export interface SourceFileBundlerVisitorOptions extends DeclarationBundlerOptions, TransformerBaseOptions {
	resolveSourceFile: SourceFileResolver;
	context: TS.TransformationContext;
	otherEntrySourceFilesForChunk: TS.SourceFile[];
	lexicalEnvironment: LexicalEnvironment;
	includedSourceFiles: Set<string>;

	// Declarations are represented by IDs which are mapped a string, indicating the deconflicted names for them
	declarationToDeconflictedBindingMap: Map<number, string>;
	preservedImports: Map<string, Set<ImportedSymbol>>;
	inlinedModules: Map<string, string>;
}
