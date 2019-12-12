import {TreeShakerVisitorOptions} from "../tree-shaker-visitor-options";
import {TS} from "../../../../../../type/ts";

export function visitModuleDeclaration({
	node,
	continuation,
	typescript
}: TreeShakerVisitorOptions<TS.ModuleDeclaration>): TS.ModuleDeclaration | undefined {
	const nameContinuationResult = continuation(node.name);
	if (nameContinuationResult == null) {
		return undefined;
	}
	return node.name === nameContinuationResult
		? node
		: typescript.updateModuleDeclaration(node, node.decorators, node.modifiers, nameContinuationResult, node.body);
}
