import {TreeShakerVisitorOptions} from "../tree-shaker-visitor-options";
import {TS} from "../../../../../../../type/ts";

export function visitInterfaceDeclaration({
	node,
	continuation,
	typescript
}: TreeShakerVisitorOptions<TS.InterfaceDeclaration>): TS.InterfaceDeclaration | undefined {
	const nameContinuationResult = continuation(node.name);
	if (nameContinuationResult == null) {
		return undefined;
	}
	return node.name === nameContinuationResult
		? node
		: typescript.updateInterfaceDeclaration(
				node,
				node.decorators,
				node.modifiers,
				nameContinuationResult,
				node.typeParameters,
				node.heritageClauses,
				node.members
		  );
}
