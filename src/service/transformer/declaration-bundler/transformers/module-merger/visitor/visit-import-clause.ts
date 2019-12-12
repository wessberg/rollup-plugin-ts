import {ModuleMergerVisitorOptions, VisitResult} from "../module-merger-visitor-options";
import {TS} from "../../../../../../type/ts";
import {getImportedSymbolFromImportClauseName} from "../../../util/create-export-specifier-from-name-and-modifiers";
import {preserveSymbols} from "../../../util/clone-node-with-symbols";
import {createAliasedBinding} from "../../../util/create-aliased-binding";
import {traceIdentifiers} from "../../trace-identifiers/trace-identifiers";
import {getAliasedDeclaration} from "../../../util/get-aliased-declaration";

export function visitImportClause(options: ModuleMergerVisitorOptions<TS.ImportClause>): VisitResult<TS.ImportClause> {
	const {node, payload, typescript} = options;
	// If there is no moduleSpecifier, proceed from the children.
	if (payload.moduleSpecifier == null) return options.childContinuation(node, payload);

	const matchingSourceFile = options.getMatchingSourceFile(payload.moduleSpecifier, options.sourceFile.fileName);
	const contResult = options.childContinuation(node, payload);

	if (node.name == null || contResult.name == null) {
		// If there is no name, just return the continuation result. We only concern ourselves with default imports here
		return contResult;
	}

	// If no SourceFile was resolved, preserve the ImportClause, but potentially remove the default import
	if (matchingSourceFile == null) {
		// If the default import should be preserved, return the continuation result
		if (options.shouldPreserveImportedSymbol(getImportedSymbolFromImportClauseName(contResult.name, payload.moduleSpecifier, options))) {
			return contResult;
		}

		// Otherwise, remove the default import and remove the named bindings that was retrieved from the continuation.
		return preserveSymbols(typescript.updateImportClause(contResult, undefined, contResult.namedBindings), options);
	}

	// Otherwise, prepend the nodes for the SourceFile
	options.prependNodes(...options.includeSourceFile(matchingSourceFile));

	// Now, we might be so lucky that the name of the default import _exactly_ matches that of the default export, in which case we don't need to do anything
	// So, let's test if the identifiers match between the binding given to the default import and the bound identifier of the imported declaration
	const declaration = getAliasedDeclaration({...options, node: contResult.name});

	if (declaration != null) {
		for (const identifier of traceIdentifiers({...options, node: declaration})) {
			// If the names match exactly, do nothing
			if (identifier === contResult.name.text) continue;

			// Otherwise, alias the binding
			options.prependNodes(createAliasedBinding(declaration, identifier, contResult.name.text, typescript));
		}
	}

	// Don't include the ImportClause
	return undefined;
}
