import {DeconflicterVisitorOptions} from "../deconflicter-visitor-options";
import {TS} from "../../../../../../type/ts";
import {cloneLexicalEnvironment} from "../../../util/clone-lexical-environment";
import {nodeArraysAreEqual} from "../../../util/node-arrays-are-equal";
import {ContinuationOptions} from "../deconflicter-options";
import {preserveMeta} from "../../../util/clone-node-with-meta";

/**
 * Deconflicts the given MethodSignature.
 */
export function deconflictMethodSignature(options: DeconflicterVisitorOptions<TS.MethodSignature>): TS.MethodSignature | undefined {
	const {node, continuation, lexicalEnvironment, factory, typescript} = options;
	const nameContResult = typescript.isIdentifier(node.name) ? node.name : continuation(node.name, {lexicalEnvironment});

	// The type, type parameters, as well as the parameters share the same lexical environment
	const nextContinuationOptions: ContinuationOptions = {lexicalEnvironment: cloneLexicalEnvironment(lexicalEnvironment)};

	const typeParametersContResult =
		node.typeParameters == null ? undefined : factory.createNodeArray(node.typeParameters.map(typeParameter => continuation(typeParameter, nextContinuationOptions)));
	const parametersContResult = factory.createNodeArray(node.parameters.map(parameter => continuation(parameter, nextContinuationOptions)));
	const typeContResult = node.type == null ? undefined : continuation(node.type, nextContinuationOptions);

	const isIdentical =
		nameContResult === node.name &&
		nodeArraysAreEqual(typeParametersContResult, node.typeParameters) &&
		nodeArraysAreEqual(parametersContResult, node.parameters) &&
		typeContResult === node.type;

	if (isIdentical) {
		return node;
	}

	return preserveMeta(
		factory.updateMethodSignature(node, node.modifiers, nameContResult, node.questionToken, typeParametersContResult, parametersContResult, typeContResult),
		node,
		options
	);
}
