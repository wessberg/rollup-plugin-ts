import {DeconflicterVisitorOptions} from "../deconflicter-visitor-options.js";
import {TS} from "../../../../../../type/ts.js";
import {getBindingFromLexicalEnvironment} from "../../../util/get-binding-from-lexical-environment.js";
import {preserveMeta} from "../../../util/clone-node-with-meta.js";
import {getBestDeclaration} from "../../../util/get-aliased-declaration.js";
import {getIdForNode} from "../../../util/get-id-for-node.js";

/**
 * Deconflicts the given Identifier.
 */
export function deconflictIdentifier(options: DeconflicterVisitorOptions<TS.Identifier>): TS.Identifier | undefined {
	const {node, lexicalEnvironment, declarationToDeconflictedBindingMap, factory} = options;
	const id = getIdForNode({...options, node: getBestDeclaration(options) ?? node});

	const envLookupResult = getBindingFromLexicalEnvironment(lexicalEnvironment, node.text);
	const deconflictedBindingMapLookupResult = id == null ? undefined : declarationToDeconflictedBindingMap.get(id);
	const textResult = deconflictedBindingMapLookupResult != null && deconflictedBindingMapLookupResult.startsWith(node.text) ? deconflictedBindingMapLookupResult : envLookupResult;
	const isIdentical = textResult === node.text;

	if (isIdentical || textResult == null) {
		return node;
	}

	return preserveMeta(factory.createIdentifier(textResult), node, options);
}
