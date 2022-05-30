import {TreeShakerVisitorOptions} from "../tree-shaker-visitor-options.js";
import {TS} from "../../../../../../type/ts.js";
import {preserveMeta} from "../../../util/clone-node-with-meta.js";

export function visitImportEqualsDeclaration(options: TreeShakerVisitorOptions<TS.ImportEqualsDeclaration>): TS.ImportEqualsDeclaration | undefined {
	const {node, continuation, factory} = options;
	const nameContinuationResult = node.name == null ? undefined : continuation(node.name);

	if (nameContinuationResult == null) {
		return undefined;
	}
	return node.name === nameContinuationResult
		? node
		: preserveMeta(factory.updateImportEqualsDeclaration(node, node.decorators, node.modifiers, node.isTypeOnly, nameContinuationResult, node.moduleReference), node, options);
}
