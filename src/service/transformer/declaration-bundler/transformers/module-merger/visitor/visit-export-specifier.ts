import {ModuleMergerVisitorOptions, VisitResult} from "../module-merger-visitor-options";
import {TS} from "../../../../../../type/ts";
import {preserveSymbols} from "../../../util/clone-node-with-symbols";
import {getAliasedDeclaration} from "../../../util/get-aliased-declaration";
import {traceIdentifiers} from "../../trace-identifiers/trace-identifiers";

export function visitExportSpecifier(options: ModuleMergerVisitorOptions<TS.ExportSpecifier>): VisitResult<TS.ExportSpecifier> {
	const {node, payload, typescript} = options;
	if (payload.moduleSpecifier == null) return options.childContinuation(node, undefined);

	const contResult = options.childContinuation(node, undefined);

	// If no SourceFile was resolved, preserve the export as it is.
	if (payload.matchingSourceFile == null) {
		return contResult;
	}

	options.prependNodes(...options.includeSourceFile(payload.matchingSourceFile));

	// Now, we might be referencing the default export from the original module, in which case this should be rewritten to point to the exact identifier
	const propertyName = contResult.propertyName ?? contResult.name;

	// If it isn't, we can safely just leave the node as it is
	if (propertyName.text !== "default") {
		return node;
	}

	// Otherwise, we'll have to rewrite it so it matches the name of the default export of the referenced module. To find out, resolve the original declaration
	const declaration = getAliasedDeclaration({...options, node: propertyName});

	if (declaration != null) {
		// Take the first identifier for the node
		const [firstIdentifier] = traceIdentifiers({...options, node: declaration});
		if (firstIdentifier != null) {
			// Update the ExportSpecifier
			return preserveSymbols(
				typescript.updateExportSpecifier(
					contResult,
					firstIdentifier === contResult.name.text ? undefined : typescript.createIdentifier(firstIdentifier),
					typescript.createIdentifier(contResult.name.text)
				),
				options
			);
		}
	}

	// Fall back to preserving the node
	return node;
}
