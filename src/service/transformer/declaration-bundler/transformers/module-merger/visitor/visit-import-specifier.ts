import {ModuleMergerVisitorOptions, VisitResult} from "../module-merger-visitor-options";
import {TS} from "../../../../../../type/ts";
import {createAliasedBinding} from "../../../util/create-aliased-binding";
import {getImportedSymbolFromImportSpecifier} from "../../../util/create-export-specifier-from-name-and-modifiers";
import {getAliasedDeclaration} from "../../../util/get-aliased-declaration";
import {traceIdentifiers} from "../../trace-identifiers/trace-identifiers";

export function visitImportSpecifier(options: ModuleMergerVisitorOptions<TS.ImportSpecifier>): VisitResult<TS.ImportSpecifier> {
	const {node, payload, typescript, lexicalEnvironment} = options;
	if (payload.moduleSpecifier == null) return options.childContinuation(node, undefined);

	const contResult = options.childContinuation(node, undefined);

	// If no SourceFile was resolved, preserve the ImportSpecifier as-is, unless it is already included in the chunk
	if (payload.matchingSourceFile == null) {
		return options.shouldPreserveImportedSymbol(getImportedSymbolFromImportSpecifier(contResult, payload.moduleSpecifier, options))
			? contResult
			: undefined;
	}

	// Otherwise, prepend the nodes for the SourceFile
	options.prependNodes(...options.includeSourceFile(payload.matchingSourceFile));

	// Also, depending on the kind of node that represents the defined symbol, we may need to add a VariableStatement or a TypeAliasDeclaration that declares if it is something like {Foo as Bar}
	if (node.propertyName != null) {
		const declaration = getAliasedDeclaration({...options, typescript, lexicalEnvironment, node: node.propertyName});
		let propertyName =
			declaration == null ? node.propertyName.text : options.declarationToDeconflictedBindingMap.get(declaration.id) ?? node.propertyName.text;

		if (propertyName === "default" && declaration != null) {
			// Now, If the property name is 'default', we'll have to instead use the identifying name for the default export of the referenced module
			const [firstIdentifier] = traceIdentifiers({...options, node: declaration});
			if (firstIdentifier != null) {
				propertyName = firstIdentifier;
			}
		}

		options.prependNodes(createAliasedBinding(declaration, propertyName, node.name.text, typescript));
	}

	// Don't include the ImportSpecifier
	return undefined;
}
