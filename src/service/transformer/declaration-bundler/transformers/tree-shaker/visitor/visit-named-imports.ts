import {TreeShakerVisitorOptions} from "../tree-shaker-visitor-options.js";
import {TS} from "../../../../../../type/ts.js";

export function visitNamedImports({node, continuation, factory}: TreeShakerVisitorOptions<TS.NamedImports>): TS.NamedImports | undefined {
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

	return factory.updateNamedImports(node, filteredSpecifiers);
}
