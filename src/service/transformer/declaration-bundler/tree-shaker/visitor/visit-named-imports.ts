import {createEmptyStatement, EmptyStatement, ImportSpecifier, isEmptyStatement, NamedImports, updateNamedImports} from "typescript";
import {TreeShakerVisitorOptions} from "../tree-shaker-visitor-options";

export function visitNamedImports({node, continuation}: TreeShakerVisitorOptions<NamedImports>): NamedImports | EmptyStatement {
	const filteredSpecifiers: ImportSpecifier[] = [];
	for (const importSpecifier of node.elements) {
		const importSpecifierContinuationResult = continuation(importSpecifier);

		if (importSpecifierContinuationResult != null && !isEmptyStatement(importSpecifierContinuationResult)) {
			filteredSpecifiers.push(importSpecifierContinuationResult);
		}
	}
	if (filteredSpecifiers.length < 1) {
		return createEmptyStatement();
	}

	return updateNamedImports(
		node,
		filteredSpecifiers
	);
}
