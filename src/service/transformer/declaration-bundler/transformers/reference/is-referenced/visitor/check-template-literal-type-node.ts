import {ReferenceVisitorOptions} from "../reference-visitor-options.js";
import {TS} from "../../../../../../../type/ts.js";

export function checkTemplateLiteralTypeNode({node, continuation}: ReferenceVisitorOptions<TS.TemplateLiteralTypeNode>): string[] {
	const referencedIdentifiers: string[] = [];

	if (node.head != null) {
		referencedIdentifiers.push(...continuation(node.head));
	}

	if (node.templateSpans != null) {
		for (const templateSpan of node.templateSpans) {
			referencedIdentifiers.push(...continuation(templateSpan));
		}
	}

	return referencedIdentifiers;
}
