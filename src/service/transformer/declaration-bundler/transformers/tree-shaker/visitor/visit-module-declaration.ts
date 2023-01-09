import {TreeShakerVisitorOptions} from "../tree-shaker-visitor-options.js";
import {TS} from "../../../../../../type/ts.js";
import {isNodeInternalAlias} from "../../../util/node-util.js";
import {preserveMeta} from "../../../util/clone-node-with-meta.js";

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
		: preserveMeta(factory.updateModuleDeclaration(node, node.modifiers, nameContinuationResult, node.body), node, options);
}
