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
		: preserveMeta(
				compatFactory.createImportEqualsDeclaration.length === 4
					? (((compatFactory as unknown) as import("typescript-4-1-2").NodeFactory).updateImportEqualsDeclaration(
							node,
							node.decorators,
							node.modifiers,
							nameContinuationResult,
							node.moduleReference
					  ) as TS.ImportEqualsDeclaration)
					: compatFactory.updateImportEqualsDeclaration(node, node.decorators, node.modifiers, node.isTypeOnly, nameContinuationResult, node.moduleReference),
				node,
				options
		  );
}
