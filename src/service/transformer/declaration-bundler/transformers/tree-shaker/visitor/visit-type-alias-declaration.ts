import {TreeShakerVisitorOptions} from "../tree-shaker-visitor-options";
import {TS} from "../../../../../../type/ts";

export function visitTypeAliasDeclaration({node, continuation, compatFactory}: TreeShakerVisitorOptions<TS.TypeAliasDeclaration>): TS.TypeAliasDeclaration | undefined {
	const nameContinuationResult = continuation(node.name);
	if (nameContinuationResult == null) {
		return undefined;
	}
	return node.name === nameContinuationResult
		? node
		: compatFactory.updateTypeAliasDeclaration(node, node.decorators, node.modifiers, nameContinuationResult, node.typeParameters, node.type);
}
