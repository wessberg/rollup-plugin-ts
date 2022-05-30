import {DeconflicterVisitorOptions} from "../deconflicter-visitor-options.js";
import {TS} from "../../../../../../type/ts.js";
import {cloneLexicalEnvironment} from "../../../util/clone-lexical-environment.js";
import {nodeArraysAreEqual} from "../../../util/node-arrays-are-equal.js";
import {ContinuationOptions} from "../deconflicter-options.js";
import {preserveMeta} from "../../../util/clone-node-with-meta.js";

/**
 * Deconflicts the given GetAccessorDeclaration.
 */
export function deconflictGetAccessorDeclaration(options: DeconflicterVisitorOptions<TS.GetAccessorDeclaration>): TS.GetAccessorDeclaration | undefined {
	const {node, continuation, lexicalEnvironment, factory, typescript} = options;
	const nameContResult = typescript.isIdentifier(node.name) ? node.name : continuation(node.name, {lexicalEnvironment});

	// The body, as well as the parameters share the same lexical environment
	const nextContinuationOptions: ContinuationOptions = {lexicalEnvironment: cloneLexicalEnvironment(lexicalEnvironment)};

	const parametersContResult = node.parameters.map(parameter => continuation(parameter, nextContinuationOptions));
	const typeContResult = node.type == null ? undefined : continuation(node.type, nextContinuationOptions);
	const bodyContResult = node.body == null ? undefined : continuation(node.body, nextContinuationOptions);

	const isIdentical = nameContResult === node.name && nodeArraysAreEqual(parametersContResult, node.parameters) && typeContResult === node.type && bodyContResult === node.body;

	if (isIdentical) {
		return node;
	}

	return preserveMeta(
		factory.updateGetAccessorDeclaration(node, node.decorators, node.modifiers, nameContResult, parametersContResult, typeContResult, bodyContResult),
		node,
		options
	);
}
