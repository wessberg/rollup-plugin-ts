import {DeconflicterVisitorOptions} from "../deconflicter-visitor-options.js";
import {TS} from "../../../../../../type/ts.js";
import {cloneLexicalEnvironment} from "../../../util/clone-lexical-environment.js";
import {nodeArraysAreEqual} from "../../../util/node-arrays-are-equal.js";
import {ContinuationOptions} from "../deconflicter-options.js";
import {preserveMeta} from "../../../util/clone-node-with-meta.js";

/**
 * Deconflicts the given SetAccessorDeclaration.
 */
export function deconflictSetAccessorDeclaration(options: DeconflicterVisitorOptions<TS.SetAccessorDeclaration>): TS.SetAccessorDeclaration | undefined {
	const {node, continuation, lexicalEnvironment, factory, typescript} = options;
	const nameContResult = typescript.isIdentifier(node.name) ? node.name : continuation(node.name, {lexicalEnvironment});

	// The body, as well as the parameters share the same lexical environment
	const nextContinuationOptions: ContinuationOptions = {lexicalEnvironment: cloneLexicalEnvironment(lexicalEnvironment)};

	const parametersContResult = node.parameters.map(parameter => continuation(parameter, nextContinuationOptions));
	const bodyContResult = node.body == null ? undefined : continuation(node.body, nextContinuationOptions);

	const isIdentical = nameContResult === node.name && nodeArraysAreEqual(parametersContResult, node.parameters) && bodyContResult === node.body;

	if (isIdentical) {
		return node;
	}
	return preserveMeta(factory.updateSetAccessorDeclaration(node, node.decorators, node.modifiers, nameContResult, parametersContResult, bodyContResult), node, options);
}
