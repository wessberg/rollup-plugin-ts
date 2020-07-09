import {TreeShakerVisitorOptions} from "../tree-shaker-visitor-options";
import {TS} from "../../../../../../type/ts";
import {preserveMeta} from "../../../util/clone-node-with-meta";

export function visitInterfaceDeclaration(options: TreeShakerVisitorOptions<TS.InterfaceDeclaration>): TS.InterfaceDeclaration | undefined {
	const {node, continuation, compatFactory} = options;
	const nameContinuationResult = continuation(node.name);
	if (nameContinuationResult == null) {
		return undefined;
	}
	return node.name === nameContinuationResult
		? node
		: preserveMeta(
				compatFactory.updateInterfaceDeclaration(node, node.decorators, node.modifiers, nameContinuationResult, node.typeParameters, node.heritageClauses, node.members),
				node,
				options
		  );
}
