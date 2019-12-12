import {DeconflicterVisitorOptions} from "../deconflicter-visitor-options";
import {TS} from "../../../../../../type/ts";
import {cloneLexicalEnvironment} from "../../../util/clone-lexical-environment";
import {nodeArraysAreEqual} from "../../../util/node-arrays-are-equal";
import {addBindingToLexicalEnvironment} from "../../../util/add-binding-to-lexical-environment";
import {isIdentifierFree} from "../../../util/is-identifier-free";
import {generateUniqueBinding} from "../../../util/generate-unique-binding";
import {ContinuationOptions} from "../deconflicter-options";
import {getIdForNode} from "../../../util/get-id-for-node";
import {preserveSymbols} from "../../../util/clone-node-with-symbols";

/**
 * Deconflicts the given FunctionExpression.
 */
export function deconflictFunctionExpression(options: DeconflicterVisitorOptions<TS.FunctionExpression>): TS.FunctionExpression | undefined {
	const {node, continuation, lexicalEnvironment, typescript, declarationToDeconflictedBindingMap} = options;
	let nameContResult: TS.FunctionExpression["name"];

	if (node.name != null) {
		const id = getIdForNode(options);
		if (isIdentifierFree(lexicalEnvironment, node.name.text)) {
			nameContResult = node.name;
			if (id != null) declarationToDeconflictedBindingMap.set(id, node.name.text);

			// The name creates a new local binding within the current LexicalEnvironment
			addBindingToLexicalEnvironment(lexicalEnvironment, node.name.text);
		} else {
			// Otherwise, deconflict it
			const uniqueBinding = generateUniqueBinding(lexicalEnvironment, node.name.text);
			nameContResult = typescript.createIdentifier(uniqueBinding);
			if (id != null) declarationToDeconflictedBindingMap.set(id, uniqueBinding);

			// The name creates a new local binding within the current LexicalEnvironment
			addBindingToLexicalEnvironment(lexicalEnvironment, uniqueBinding, node.name.text);
		}
	}

	// The body, type, type parameters, as well as the parameters share the same lexical environment
	const nextContinuationOptions: ContinuationOptions = {lexicalEnvironment: cloneLexicalEnvironment(lexicalEnvironment)};

	const typeParametersContResult =
		node.typeParameters == null ? undefined : node.typeParameters.map(typeParameter => continuation(typeParameter, nextContinuationOptions));
	const parametersContResult = node.parameters.map(parameter => continuation(parameter, nextContinuationOptions));
	const typeContResult = node.type == null ? undefined : continuation(node.type, nextContinuationOptions);
	const bodyContResult = continuation(node.body, nextContinuationOptions);

	const isIdentical =
		nameContResult === node.name &&
		nodeArraysAreEqual(typeParametersContResult, node.typeParameters) &&
		nodeArraysAreEqual(parametersContResult, node.parameters) &&
		typeContResult === node.type &&
		bodyContResult === node.body;

	if (isIdentical) {
		return node;
	}

	return preserveSymbols(
		typescript.updateFunctionExpression(
			node,
			node.modifiers,
			node.asteriskToken,
			nameContResult,
			typeParametersContResult,
			parametersContResult,
			typeContResult,
			bodyContResult
		),
		options
	);
}
