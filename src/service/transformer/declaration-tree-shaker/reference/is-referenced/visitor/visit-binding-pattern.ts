import {BindingPattern} from "typescript";
import {VisitorOptions} from "../visitor-options";

/**
 * Visits the given BindingPattern.
 * @param {BindingPattern} currentNode
 * @param {VisitorOptions} options
 */
export function visitBindingPattern(currentNode: BindingPattern, {continuation}: VisitorOptions): void {
	for (const element of currentNode.elements) {
		continuation(element);
	}
}
