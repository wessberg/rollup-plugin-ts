import {ReferenceVisitorOptions} from "../reference-visitor-options";
import {IndexedAccessTypeNode} from "typescript";

export function checkIndexedAccessTypeNode ({node, continuation}: ReferenceVisitorOptions<IndexedAccessTypeNode>): string[] {
	const referencedIdentifiers: string[] = [];

	referencedIdentifiers.push(...continuation(node.indexType));
	referencedIdentifiers.push(...continuation(node.objectType));
	return referencedIdentifiers;
}
