import type {ReferenceVisitorOptions} from "../reference-visitor-options.js";
import type {TS} from "../../../../../../../type/ts.js";

export function checkTemplateLiteralTypeSpan({node, continuation}: ReferenceVisitorOptions<TS.TemplateLiteralTypeSpan>): string[] {
	const referencedIdentifiers: string[] = [];

	if (node.type != null) {
		referencedIdentifiers.push(...continuation(node.type));
	}

	return referencedIdentifiers;
}
