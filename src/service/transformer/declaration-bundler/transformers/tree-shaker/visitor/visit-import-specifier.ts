import {TreeShakerVisitorOptions} from "../tree-shaker-visitor-options";
import {TS} from "../../../../../../type/ts";

export function visitImportSpecifier({node, continuation, compatFactory}: TreeShakerVisitorOptions<TS.ImportSpecifier>): TS.ImportSpecifier | undefined {
	const nameContinuationResult = continuation(node.name);
	if (nameContinuationResult == null) {
		return undefined;
	}

	return node.name === nameContinuationResult ? node : compatFactory.updateImportSpecifier(node, node.propertyName, nameContinuationResult);
}
