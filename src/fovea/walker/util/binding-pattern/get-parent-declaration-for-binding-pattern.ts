import {BindingPattern, Declaration, isBindingElement} from "typescript";
import {getParentDeclarationForBindingElement} from "../binding-element/get-parent-declaration-for-binding-element";

/**
 * Gets the first parent declaration for a BindingPattern that isn't itself a Binding
 * @param {BindingPattern} bindingPattern
 * @returns {Declaration}
 */
export function getParentDeclarationForBindingPattern (bindingPattern: BindingPattern): Declaration {
	if (isBindingElement(bindingPattern.parent)) return getParentDeclarationForBindingElement(bindingPattern.parent);
	return bindingPattern.parent;
}