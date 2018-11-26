import {BindingElement, Declaration} from "typescript";
import {getParentDeclarationForBindingPattern} from "../binding-pattern/get-parent-declaration-for-binding-pattern";

/**
 * Gets the first parent declaration for a BindingElement that isn't itself a Binding
 * @param {BindingElement} bindingElement
 * @returns {Declaration}
 */
export function getParentDeclarationForBindingElement (bindingElement: BindingElement): Declaration {
	return getParentDeclarationForBindingPattern(bindingElement.parent);
}