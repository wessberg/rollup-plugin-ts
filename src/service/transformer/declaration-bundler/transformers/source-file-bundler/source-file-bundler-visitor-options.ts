import type {TS} from "../../../../../type/ts.js";
import type {DeclarationBundlerOptions} from "../../declaration-bundler-options.js";
import type {LexicalEnvironment} from "../deconflicter/deconflicter-options.js";
import type {ImportedSymbol} from "../track-imports-transformer/track-imports-transformer-visitor-options.js";
import type {TransformerBaseOptions} from "../transformer-base-options.js";

export type SourceFileResolver = (fileName: string, from: string) => TS.SourceFile | undefined;

export interface SourceFileBundlerVisitorOptions extends DeclarationBundlerOptions, TransformerBaseOptions {
	allowExports?: boolean | "skip-optional";
	resolveSourceFile: SourceFileResolver;
	context: TS.TransformationContext;
	entrySourceFilesForChunk: TS.SourceFile[];
	otherEntrySourceFilesForChunk: TS.SourceFile[];
	lexicalEnvironment: LexicalEnvironment;
	includedSourceFiles: Set<string>;

	// Declarations are represented by IDs which are mapped a string, indicating the deconflicted names for them
	declarationToDeconflictedBindingMap: Map<number, string>;
	preservedImports: Map<string, Set<ImportedSymbol>>;
	inlinedModules: Map<string, string>;
}
