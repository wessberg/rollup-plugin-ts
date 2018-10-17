import {OutputBundle} from "rollup";

/**
 * Takes all filenames that has been included in the given bundle
 * @param {OutputBundle} bundle
 * @returns {Set<string>}
 */
export function takeBundledFilesNames (bundle: OutputBundle): Set<string> {
	const bundledFilenames: Set<string> = new Set();
	Object.values(bundle).forEach(value => {
		if (value instanceof Buffer) return;

		else if (typeof value === "string") {
			bundledFilenames.add(value);
		} else {
			Object.keys(value.modules).forEach(fileName => bundledFilenames.add(fileName));
		}
	});
	return bundledFilenames;
}