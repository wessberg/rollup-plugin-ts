import {BindingPattern} from "typescript";
import {ReferenceVisitorOptions} from "../../reference-visitor-options";

/**
 * Visits the given BindingPattern.
 * @param {BindingPattern} currentNode
 * @param {ReferenceVisitorOptions} options
 * @returns {boolean}
 */
export function checkBindingPattern(currentNode: BindingPattern, {continuation}: ReferenceVisitorOptions): boolean {
	for (const element of currentNode.elements) {
		if (continuation(element)) return true;
	}

	return false;
}
