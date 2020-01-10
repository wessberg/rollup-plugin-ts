import {DeconflicterVisitorOptions} from "../deconflicter-visitor-options";
import {TS} from "../../../../../../type/ts";
import {getBindingFromLexicalEnvironment} from "../../../util/get-binding-from-lexical-environment";
import {preserveMeta} from "../../../util/clone-node-with-meta";
import {getAliasedDeclaration} from "../../../util/get-aliased-declaration";

/**
 * Deconflicts the given Identifier.
 */
export function deconflictIdentifier(options: DeconflicterVisitorOptions<TS.Identifier>): TS.Identifier | undefined {
	const {node, lexicalEnvironment, declarationToDeconflictedBindingMap, typescript} = options;
	const declaration = getAliasedDeclaration(options);

	const envLookupResult = getBindingFromLexicalEnvironment(lexicalEnvironment, node.text);
	const deconflictedBindingMapLookupResult = declaration == null ? undefined : declarationToDeconflictedBindingMap.get(declaration.id);

	const textResult =
		deconflictedBindingMapLookupResult != null && deconflictedBindingMapLookupResult.startsWith(node.text)
			? deconflictedBindingMapLookupResult
			: envLookupResult;
	const isIdentical = textResult === node.text;

	if (isIdentical || textResult == null) {
		return node;
	}

	return preserveMeta(typescript.createIdentifier(textResult), node, options);
}
