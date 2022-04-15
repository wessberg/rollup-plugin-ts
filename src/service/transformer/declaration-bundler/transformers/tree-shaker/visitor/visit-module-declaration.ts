import {TreeShakerVisitorOptions} from "../tree-shaker-visitor-options";
import {TS} from "../../../../../../type/ts";
import { isNodeInternalAlias } from "../../../util/node-util";
import { preserveMeta } from "../../../util/clone-node-with-meta";

export function visitModuleDeclaration(options: TreeShakerVisitorOptions<TS.ModuleDeclaration>): TS.ModuleDeclaration | undefined {
	const {node, continuation, factory, typescript} = options;
	
	if (!isNodeInternalAlias(node, typescript)) {
		return node;
	}

	const nameContinuationResult = continuation(node.name);
	if (nameContinuationResult == null) {
		return undefined;
	}
	return node.name === nameContinuationResult
		? node
		: preserveMeta(
				factory.updateModuleDeclaration(node, node.decorators, node.modifiers, nameContinuationResult, node.body),
				node,
				options
		  );
}
