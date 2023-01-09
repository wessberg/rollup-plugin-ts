import {TreeShakerVisitorOptions} from "../tree-shaker-visitor-options.js";
import {TS} from "../../../../../../type/ts.js";
import {preserveMeta} from "../../../util/clone-node-with-meta.js";

export function visitInterfaceDeclaration(options: TreeShakerVisitorOptions<TS.InterfaceDeclaration>): TS.InterfaceDeclaration | undefined {
	const {node, continuation, factory} = options;
	const nameContinuationResult = continuation(node.name);
	if (nameContinuationResult == null) {
		return undefined;
	}
	return node.name === nameContinuationResult
		? node
		: preserveMeta(
				factory.updateInterfaceDeclaration(node, node.modifiers, nameContinuationResult, node.typeParameters, node.heritageClauses, node.members),
				node,
				options
		  );
}
