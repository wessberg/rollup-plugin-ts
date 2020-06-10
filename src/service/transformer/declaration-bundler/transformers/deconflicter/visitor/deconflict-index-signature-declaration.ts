import {DeconflicterVisitorOptions} from "../deconflicter-visitor-options";
import {TS} from "../../../../../../type/ts";
import {cloneLexicalEnvironment} from "../../../util/clone-lexical-environment";
import {nodeArraysAreEqual} from "../../../util/node-arrays-are-equal";
import {ContinuationOptions} from "../deconflicter-options";
import {preserveMeta} from "../../../util/clone-node-with-meta";

/**
 * Deconflicts the given IndexSignatureDeclaration.
 */
export function deconflictIndexSignatureDeclaration(options: DeconflicterVisitorOptions<TS.IndexSignatureDeclaration>): TS.IndexSignatureDeclaration | undefined {
	const {node, continuation, lexicalEnvironment, typescript} = options;
	// The whole thing has its own lexical environment
	const nextContinuationOptions: ContinuationOptions = {lexicalEnvironment: cloneLexicalEnvironment(lexicalEnvironment)};

	const nameContResult = node.name == null ? undefined : typescript.isIdentifier(node.name) ? node.name : continuation(node.name, nextContinuationOptions);
	const typeParametersContResult = node.typeParameters == null ? undefined : node.typeParameters.map(typeParameter => continuation(typeParameter, nextContinuationOptions));
	const parametersContResult = node.parameters.map(parameter => continuation(parameter, nextContinuationOptions));
	const typeContResult = node.type == null ? undefined : continuation(node.type, nextContinuationOptions);

	const isIdentical =
		nameContResult === node.name &&
		nodeArraysAreEqual(typeParametersContResult, node.typeParameters) &&
		nodeArraysAreEqual(parametersContResult, node.parameters) &&
		typeContResult === node.type;

	if (isIdentical) {
		return node;
	}

	return preserveMeta(typescript.updateIndexSignature(node, node.decorators, node.modifiers, parametersContResult, typeContResult!), node, options);
}
