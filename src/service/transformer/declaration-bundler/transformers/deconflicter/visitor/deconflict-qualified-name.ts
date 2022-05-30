import {DeconflicterVisitorOptions} from "../deconflicter-visitor-options.js";
import {TS} from "../../../../../../type/ts.js";
import {preserveMeta} from "../../../util/clone-node-with-meta.js";

/**
 * Deconflicts the given QualifiedName.
 */
export function deconflictQualifiedName(options: DeconflicterVisitorOptions<TS.QualifiedName>): TS.QualifiedName | undefined {
	const {node, continuation, lexicalEnvironment, factory} = options;
	const leftContResult = continuation(node.left, {lexicalEnvironment});

	const isIdentical = leftContResult === node.left;

	if (isIdentical) {
		return node;
	}

	return preserveMeta(factory.updateQualifiedName(node, leftContResult, node.right), node, options);
}
