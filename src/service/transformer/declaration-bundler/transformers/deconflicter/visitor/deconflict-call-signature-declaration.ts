import type {DeconflicterVisitorOptions} from "../deconflicter-visitor-options.js";
import type {TS} from "../../../../../../type/ts.js";
import {cloneLexicalEnvironment} from "../../../util/clone-lexical-environment.js";
import {nodeArraysAreEqual} from "../../../util/node-arrays-are-equal.js";
import type {ContinuationOptions} from "../deconflicter-options.js";
import {preserveMeta} from "../../../util/clone-node-with-meta.js";

/**
 * Deconflicts the given CallSignature.
 */
export function deconflictCallSignatureDeclaration(options: DeconflicterVisitorOptions<TS.CallSignatureDeclaration>): TS.CallSignatureDeclaration | undefined {
	const {node, continuation, lexicalEnvironment, factory} = options;

	// The type, type parameters, as well as the parameters share the same lexical environment
	const nextContinuationOptions: ContinuationOptions = {lexicalEnvironment: cloneLexicalEnvironment(lexicalEnvironment)};

	const typeParametersContResult =
		node.typeParameters == null ? undefined : factory.createNodeArray(node.typeParameters.map(typeParameter => continuation(typeParameter, nextContinuationOptions)));
	const parametersContResult = factory.createNodeArray(node.parameters.map(parameter => continuation(parameter, nextContinuationOptions)));
	const typeContResult = node.type == null ? undefined : continuation(node.type, nextContinuationOptions);

	const isIdentical =
		nodeArraysAreEqual(typeParametersContResult, node.typeParameters) && nodeArraysAreEqual(parametersContResult, node.parameters) && typeContResult === node.type;

	if (isIdentical) {
		return node;
	}

	return preserveMeta(factory.updateCallSignature(node, typeParametersContResult, parametersContResult, typeContResult), node, options);
}
