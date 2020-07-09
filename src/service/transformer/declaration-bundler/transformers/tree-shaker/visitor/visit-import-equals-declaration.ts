import {TreeShakerVisitorOptions} from "../tree-shaker-visitor-options";
import {TS} from "../../../../../../type/ts";
import {preserveMeta} from "../../../util/clone-node-with-meta";

export function visitImportEqualsDeclaration(options: TreeShakerVisitorOptions<TS.ImportEqualsDeclaration>): TS.ImportEqualsDeclaration | undefined {
	const {node, continuation, compatFactory} = options;
	const nameContinuationResult = node.name == null ? undefined : continuation(node.name);

	if (nameContinuationResult == null) {
		return undefined;
	}
	return node.name === nameContinuationResult
		? node
		: preserveMeta(compatFactory.updateImportEqualsDeclaration(node, node.decorators, node.modifiers, nameContinuationResult, node.moduleReference), node, options);
}
