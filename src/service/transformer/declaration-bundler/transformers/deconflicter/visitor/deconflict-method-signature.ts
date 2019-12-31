import {DeconflicterVisitorOptions} from "../deconflicter-visitor-options";
import {TS} from "../../../../../../type/ts";
import {cloneLexicalEnvironment} from "../../../util/clone-lexical-environment";
import {nodeArraysAreEqual} from "../../../util/node-arrays-are-equal";
import {ContinuationOptions} from "../deconflicter-options";
import {preserveSymbols} from "../../../util/clone-node-with-symbols";

/**
 * Deconflicts the given MethodSignature.
 */
export function deconflictMethodSignature(options: DeconflicterVisitorOptions<TS.MethodSignature>): TS.MethodSignature | undefined {
	const {node, continuation, lexicalEnvironment, typescript} = options;
	const nameContResult = typescript.isIdentifier(node.name) ? node.name : continuation(node.name, {lexicalEnvironment});

	// The type, type parameters, as well as the parameters share the same lexical environment
	const nextContinuationOptions: ContinuationOptions = {lexicalEnvironment: cloneLexicalEnvironment(lexicalEnvironment)};

	const typeParametersContResult =
		node.typeParameters == null
			? undefined
			: typescript.createNodeArray(node.typeParameters.map(typeParameter => continuation(typeParameter, nextContinuationOptions)));
	const parametersContResult = typescript.createNodeArray(node.parameters.map(parameter => continuation(parameter, nextContinuationOptions)));
	const typeContResult = node.type == null ? undefined : continuation(node.type, nextContinuationOptions);

	const isIdentical =
		nameContResult === node.name &&
		nodeArraysAreEqual(typeParametersContResult, node.typeParameters) &&
		nodeArraysAreEqual(parametersContResult, node.parameters) &&
		typeContResult === node.type;

	if (isIdentical) {
		return node;
	}

	return preserveSymbols(
		typescript.updateMethodSignature(node, typeParametersContResult, parametersContResult, typeContResult, nameContResult, node.questionToken),
		options
	);
}
