import {TreeShakerVisitorOptions} from "../tree-shaker-visitor-options";
import {TS} from "../../../../../../../type/ts";

export function visitClassDeclaration({
	node,
	continuation,
	typescript
}: TreeShakerVisitorOptions<TS.ClassDeclaration>): TS.ClassDeclaration | undefined {
	const nameContinuationResult = node.name == null ? undefined : continuation(node.name);
	if (nameContinuationResult == null) {
		return undefined;
	}
	return node.name === nameContinuationResult
		? node
		: typescript.updateClassDeclaration(
				node,
				node.decorators,
				node.modifiers,
				nameContinuationResult,
				node.typeParameters,
				node.heritageClauses,
				node.members
		  );
}
