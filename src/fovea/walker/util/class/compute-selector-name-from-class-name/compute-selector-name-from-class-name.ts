import {NAME} from "../../../../constant/constant";
import {kebabCase} from "@wessberg/stringutil";

/**
 * Computes a selector name from the given class name
 * @param {string | undefined} className
 * @returns {string}
 */
export function computeSelectorNameFromClassName (className: string|undefined): string {
	if (className == null) return `my-${NAME.host.selector.suffixSuggestion}`;
	const kebabCased = kebabCase(className);
	if (!kebabCased.includes("-")) return `${kebabCased}-${NAME.host.selector.suffixSuggestion}`;
	return kebabCased;
}