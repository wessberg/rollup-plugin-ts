import {MAIN_FIELDS} from "../../constant/constant";

/**
 * Takes the best submodule from the given package.json
 * @param {object} pkg
 * @returns {string?}
 */
export function takeBestSubModuleFromPackage(pkg: {main?: string}): string | undefined {
	for (const field of MAIN_FIELDS) {
		const value = pkg[<keyof typeof pkg>field];
		if (value != null) {
			return value;
		}
	}

	return "index.js";
}
