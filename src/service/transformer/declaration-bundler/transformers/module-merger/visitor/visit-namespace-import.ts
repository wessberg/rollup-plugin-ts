import {ModuleMergerVisitorOptions, VisitResult} from "../module-merger-visitor-options";
import {TS} from "../../../../../../type/ts";
import {getImportedSymbolFromNamespaceImport} from "../../../util/create-export-specifier-from-name-and-modifiers";
import {ensureHasDeclareModifier} from "../../../util/modifier-util";
import {cloneLexicalEnvironment} from "../../../util/clone-lexical-environment";
import {ensureNoDeclareModifierTransformer} from "../../ensure-no-declare-modifier-transformer/ensure-no-declare-modifier-transformer";

export function visitNamespaceImport(options: ModuleMergerVisitorOptions<TS.NamespaceImport>): VisitResult<TS.NamespaceImport> {
	const {node, payload} = options;
	if (payload.moduleSpecifier == null) return options.childContinuation(node, undefined);

	const contResult = options.childContinuation(node, undefined);

	// If no SourceFile was resolved, preserve the ImportSpecifier as-is, unless it is already included in the chunk
	if (payload.matchingSourceFile == null) {
		return options.shouldPreserveImportedSymbol(getImportedSymbolFromNamespaceImport(contResult, payload.moduleSpecifier, options))
			? contResult
			: undefined;
	}

	// Otherwise, prepend the nodes for the SourceFile in a namespace declaration
	options.prependNodes(
		options.typescript.createModuleDeclaration(
			undefined,
			ensureHasDeclareModifier(undefined, options.typescript),
			options.typescript.createIdentifier(contResult.name.text),
			options.typescript.createModuleBlock([
				...options.includeSourceFile(payload.matchingSourceFile, {
					allowDuplicate: true,
					lexicalEnvironment: cloneLexicalEnvironment(),
					transformers: [ensureNoDeclareModifierTransformer]
				})
			]),
			options.typescript.NodeFlags.Namespace
		)
	);

	// Don't include the NamespaceImport
	return undefined;
}
