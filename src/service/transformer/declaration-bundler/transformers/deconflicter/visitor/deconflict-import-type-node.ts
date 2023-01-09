import {DeconflicterVisitorOptions} from "../deconflicter-visitor-options.js";
import {TS} from "../../../../../../type/ts.js";
import {preserveMeta} from "../../../util/clone-node-with-meta.js";
import {nodeArraysAreEqual} from "../../../util/node-arrays-are-equal.js";

/**
 * Deconflicts the given ImportTypeNode.
 */
export function deconflictImportTypeNode(options: DeconflicterVisitorOptions<TS.ImportTypeNode>): TS.ImportTypeNode | undefined {
	const {node, continuation, lexicalEnvironment, factory} = options;

	const argumentContResult = continuation(node.argument, {lexicalEnvironment});
	const typeArgumentsContResult = node.typeArguments == null ? undefined : node.typeArguments.map(typeArgument => continuation(typeArgument, {lexicalEnvironment}));
	const assertionContResult = node.assertions == null ? undefined : continuation(node.assertions, {lexicalEnvironment});

	const isIdentical = argumentContResult === node.argument && nodeArraysAreEqual(typeArgumentsContResult, node.typeArguments);

	if (isIdentical) {
		return node;
	}
	return preserveMeta(factory.updateImportTypeNode(node, argumentContResult, assertionContResult, node.qualifier, typeArgumentsContResult, node.isTypeOf), node, options);
}
