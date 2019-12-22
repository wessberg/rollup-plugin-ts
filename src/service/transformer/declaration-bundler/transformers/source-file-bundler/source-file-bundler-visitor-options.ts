import {TS} from "../../../../../type/ts";
import {DeclarationBundlerOptions} from "../../declaration-bundler-options";
import {LexicalEnvironment} from "../deconflicter/deconflicter-options";
import {SourceFileToExportedSymbolSet} from "../../../cross-chunk-reference-tracker/transformers/track-exports-transformer/track-exports-transformer-visitor-options";
import {ImportedSymbol} from "../../../cross-chunk-reference-tracker/transformers/track-imports-transformer/track-imports-transformer-visitor-options";

export interface SourceFileBundlerVisitorOptions extends DeclarationBundlerOptions {
	context: TS.TransformationContext;
	sourceFile: TS.SourceFile;
	otherSourceFiles: TS.SourceFile[];
	lexicalEnvironment: LexicalEnvironment;
	includedSourceFiles: WeakSet<TS.SourceFile>;

	// Declarations are represented by IDs which are mapped a string, indicating the deconflicted names for them
	declarationToDeconflictedBindingMap: Map<number, string>;

	// Some nodes are completely rewritten, under which circumstances the original symbol will be lost. However, it might be relevant to refer to the original symbol.
	// For example, for ImportTypeNodes that are replaced with an identifier, we want the Identifier to refer to the symbol of original quantifier
	nodeToOriginalSymbolMap: Map<TS.Node, TS.Symbol>;
	sourceFileToExportedSymbolSet: SourceFileToExportedSymbolSet;
	preservedImports: Map<string, Set<ImportedSymbol>>;
}
