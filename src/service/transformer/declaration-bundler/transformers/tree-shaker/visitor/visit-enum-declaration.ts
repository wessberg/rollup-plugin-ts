import {TreeShakerVisitorOptions} from "../tree-shaker-visitor-options.js";
import {TS} from "../../../../../../type/ts.js";

export function visitEnumDeclaration({node, continuation, factory}: TreeShakerVisitorOptions<TS.EnumDeclaration>): TS.EnumDeclaration | undefined {
	const nameContinuationResult = continuation(node.name);
	if (nameContinuationResult == null) {
		return undefined;
	}
	return node.name === nameContinuationResult ? node : factory.updateEnumDeclaration(node, node.decorators, node.modifiers, nameContinuationResult, node.members);
}
