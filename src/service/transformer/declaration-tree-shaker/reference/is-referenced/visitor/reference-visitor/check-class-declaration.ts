import {ClassDeclaration} from "typescript";
import {ReferenceVisitorOptions} from "../../reference-visitor-options";

/**
 * Visits the given ClassDeclaration.
 * @param {ClassDeclaration} currentNode
 * @param {ReferenceVisitorOptions} options
 */
export function checkClassDeclaration(currentNode: ClassDeclaration, {continuation}: ReferenceVisitorOptions): boolean {
	// Check if any of the heritage clauses references the Node
	if (currentNode.heritageClauses != null) {
		for (const heritageClause of currentNode.heritageClauses) {
			for (const type of heritageClause.types) {
				if (continuation(type)) return true;
			}
		}
	}

	// Check if any of the type parameters references the Node
	if (currentNode.typeParameters != null) {
		for (const typeParameter of currentNode.typeParameters) {
			if (continuation(typeParameter)) return true;
		}
	}

	// Check if any of the members references the Node
	for (const member of currentNode.members) {
		if (continuation(member)) return true;
	}

	return false;
}
