import {ReferenceVisitorOptions} from "../reference-visitor-options";
import {TS} from "../../../../../../type/ts";

export function checkIndexedAccessTypeNode({node, continuation}: ReferenceVisitorOptions<TS.IndexedAccessTypeNode>): string[] {
	const referencedIdentifiers: string[] = [];

	referencedIdentifiers.push(...continuation(node.indexType));
	referencedIdentifiers.push(...continuation(node.objectType));
	return referencedIdentifiers;
}
