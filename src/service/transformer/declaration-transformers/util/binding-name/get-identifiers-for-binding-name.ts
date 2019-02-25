import {BindingName, isArrayBindingPattern, isIdentifier, isObjectBindingPattern, isOmittedExpression} from "typescript";

/**
 * Gets all identifiers for the given BindingName
 * @param {BindingName} bindingName
 * @return {Set<string>}
 */
export function getIdentifiersForBindingName(bindingName: BindingName): Set<string> {
	const set: Set<string> = new Set();
	if (isIdentifier(bindingName)) {
		set.add(bindingName.text);
	} else if (isArrayBindingPattern(bindingName) || isObjectBindingPattern(bindingName)) {
		for (const element of bindingName.elements) {
			if (isOmittedExpression(element)) continue;
			const identifiers = getIdentifiersForBindingName(element.name);
			for (const identifier of identifiers) set.add(identifier);
		}
	}

	return set;
}
