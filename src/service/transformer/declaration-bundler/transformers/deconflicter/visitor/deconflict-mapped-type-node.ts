import {DeconflicterVisitorOptions} from "../deconflicter-visitor-options";
import {TS} from "../../../../../../type/ts";
import {cloneLexicalEnvironment} from "../../../util/clone-lexical-environment";
import {ContinuationOptions} from "../deconflicter-options";
import {preserveMeta} from "../../../util/clone-node-with-meta";

/**
 * Deconflicts the given MappedTypeNode.
 */
export function deconflictMappedTypeNode(options: DeconflicterVisitorOptions<TS.MappedTypeNode>): TS.MappedTypeNode | undefined {
	const {node, continuation, lexicalEnvironment, compatFactory} = options;
	// The TypeParameter has its own lexical environment
	const nextContinuationOptions: ContinuationOptions = {lexicalEnvironment: cloneLexicalEnvironment(lexicalEnvironment)};

	const typeParameterContResult = continuation(node.typeParameter, nextContinuationOptions);
	const typeContResult = node.type == null ? undefined : continuation(node.type, nextContinuationOptions);
	const nameTypeContResult = node.nameType == null ? undefined : continuation(node.nameType, nextContinuationOptions);

	const isIdentical = typeParameterContResult === node.typeParameter && typeContResult === node.type && nameTypeContResult === node.nameType;

	if (isIdentical) {
		return node;
	}

	// For TypeScript versions before v4.1, updateMappedTypeNode takes five arguments (since it doesn't support 'as' clauses)
	if (compatFactory.updateMappedTypeNode.length === 5) {
		const legacyCompatFactory = (compatFactory as unknown) as import("typescript-4-0-3").NodeFactory;
		return preserveMeta(
			(legacyCompatFactory.updateMappedTypeNode(
				node as never,
				node.readonlyToken as never,
				typeParameterContResult as never,
				node.questionToken as never,
				typeContResult as never
			) as unknown) as TS.MappedTypeNode,
			node,
			options
		);
	}

	// TypeScript 4.1 and forward
	else {
		return preserveMeta(
			compatFactory.updateMappedTypeNode(node, node.readonlyToken, typeParameterContResult, nameTypeContResult, node.questionToken, typeContResult),
			node,
			options
		);
	}
}
