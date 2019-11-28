import {TreeShakerVisitorOptions} from "../tree-shaker-visitor-options";
import {TS} from "../../../../../../../type/ts";

export function visitNamedImports({node, continuation, typescript}: TreeShakerVisitorOptions<TS.NamedImports>): TS.NamedImports | undefined {
	const filteredSpecifiers: TS.ImportSpecifier[] = [];
	for (const importSpecifier of node.elements) {
		const importSpecifierContinuationResult = continuation(importSpecifier);

		if (importSpecifierContinuationResult != null) {
			filteredSpecifiers.push(importSpecifierContinuationResult);
		}
	}
	if (filteredSpecifiers.length < 1) {
		return undefined;
	}

	return typescript.updateNamedImports(node, filteredSpecifiers);
}
