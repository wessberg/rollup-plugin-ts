import {readFileSync} from "../file-system/file-system";
import {MAIN_FIELDS} from "../../constant/constant";

/**
 * Takes the best submodule from the given package.json
 * @param {object | string} packageJson
 * @returns {string?}
 */
export function takeBestSubModuleFromPackage (packageJson: {main?: string}|string): string|undefined {
	const normalizedPackage = typeof packageJson === "string"
		? JSON.parse(readFileSync(packageJson).toString())
	  : packageJson;

	for (const field of MAIN_FIELDS) {
		const value = normalizedPackage[<keyof typeof normalizedPackage> field];
		if (value != null) {
			return value;
		}
	}

	return undefined;
}