import {BindingElement, isArrayBindingPattern, isIdentifier, isObjectBindingPattern} from "typescript";
import {Literal} from "../../interpreter/literal/literal";
import {IContinuation} from "../../interpreter/continuation/continuation-function";
import {LexicalEnvironment} from "../../interpreter/lexical-environment/lexical-environment";

/**
 * Performs a lookup within the given value based on the given BindingElement where there is no PropertyName
 * @param {BindingElement} element
 * @param {Literal} value
 * @param {LexicalEnvironment} environment
 * @param {IContinuation} continuation
 * @returns {Literal}
 */
function performBindingElementLookupWithoutPropertyName (element: Pick<BindingElement, Exclude<keyof BindingElement, "propertyName">>, value: Literal, environment: LexicalEnvironment, continuation: IContinuation): { [key: string]: Literal } {
	// If the value is undefined and the element has an initializer, use that value instead
	if (value == null && element.initializer != null) {
		value = continuation.run(element.initializer, environment);
	}

	if (isIdentifier(element.name)) {
		return {[element.name.text]: value[element.name.text]};
	}

	else if (isObjectBindingPattern(element.name)) {
		return Object.assign({}, ...element.name.elements.map(elem => performBindingElementLookup(elem, value, environment, continuation)));
	}

	else if (isArrayBindingPattern(element.name)) {
		throw new Error("not implemented");
	}

	else return {};
}

/**
 * Performs a lookup within the given value based on the given BindingElement
 * @param {BindingElement} element
 * @param {Literal} value
 * @param {LexicalEnvironment} environment
 * @param {IContinuation} continuation
 * @returns {Literal}
 */
export function performBindingElementLookup (element: BindingElement, value: Literal, environment: LexicalEnvironment, continuation: IContinuation): { [key: string]: Literal } {
	if (element.propertyName == null) {
		return performBindingElementLookupWithoutPropertyName(element, value, environment, continuation);
	}

	// Get The literal value of the property name
	const propertyName = continuation.run(element.propertyName, environment);

	// Pick the first part based on the property name
	let firstPart = value == null ? undefined : value[propertyName];

	// If the part is undefined and the element has an initializer, use that value instead
	if (firstPart == null && element.initializer != null) {
		firstPart = continuation.run(element.initializer, environment);
	}

	// If the name is an identifier, it is a renamed binding for what was extracted from the PropertyName.
	if (isIdentifier(element.name)) {
		return {[element.name.text]: firstPart};
	}

	else if (isObjectBindingPattern(element.name)) {
		return Object.assign({}, ...element.name.elements.map(elem => performBindingElementLookup(elem, firstPart, environment, continuation)));
	}

	else if (isArrayBindingPattern(element.name)) {
		throw new Error("not implemented");
	}

	return {};
}