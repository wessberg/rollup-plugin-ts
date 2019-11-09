import {ImportSpecifier, NamedImports, updateNamedImports} from "typescript";
import {TreeShakerVisitorOptions} from "../tree-shaker-visitor-options";

export function visitNamedImports({node, continuation}: TreeShakerVisitorOptions<NamedImports>): NamedImports | undefined {
	const filteredSpecifiers: ImportSpecifier[] = [];
	for (const importSpecifier of node.elements) {
		const importSpecifierContinuationResult = continuation(importSpecifier);

		if (importSpecifierContinuationResult != null) {
			filteredSpecifiers.push(importSpecifierContinuationResult);
		}
	}
	if (filteredSpecifiers.length < 1) {
		return undefined;
	}

	return updateNamedImports(node, filteredSpecifiers);
}
