import {DeconflicterVisitorOptions} from "../deconflicter-visitor-options";
import {TS} from "../../../../../../type/ts";
import {cloneLexicalEnvironment} from "../../../util/clone-lexical-environment";
import {nodeArraysAreEqual} from "../../../util/node-arrays-are-equal";
import {ContinuationOptions} from "../deconflicter-options";
import {preserveSymbols} from "../../../util/clone-node-with-symbols";

/**
 * Deconflicts the given MethodDeclaration.
 */
export function deconflictMethodDeclaration(options: DeconflicterVisitorOptions<TS.MethodDeclaration>): TS.MethodDeclaration | undefined {
	const {node, continuation, lexicalEnvironment, typescript} = options;
	const nameContResult = typescript.isIdentifier(node.name) ? node.name : continuation(node.name, {lexicalEnvironment});

	// The body, type, type parameters, as well as the parameters share the same lexical environment
	const nextContinuationOptions: ContinuationOptions = {lexicalEnvironment: cloneLexicalEnvironment(lexicalEnvironment)};

	const typeParametersContResult =
		node.typeParameters == null ? undefined : node.typeParameters.map(typeParameter => continuation(typeParameter, nextContinuationOptions));
	const parametersContResult = node.parameters.map(parameter => continuation(parameter, nextContinuationOptions));
	const typeContResult = node.type == null ? undefined : continuation(node.type, nextContinuationOptions);
	const bodyContResult = node.body == null ? undefined : continuation(node.body, nextContinuationOptions);

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
		typescript.updateMethod(
			node,
			node.decorators,
			node.modifiers,
			node.asteriskToken,
			nameContResult,
			node.questionToken,
			typeParametersContResult,
			parametersContResult,
			typeContResult,
			bodyContResult
		),
		options
	);
}
