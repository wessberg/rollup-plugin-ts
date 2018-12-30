import {OutputBundle} from "rollup";
import {isOutputChunk} from "../is-output-chunk/is-output-chunk";

/**
 * Takes all filenames that has been included in the given bundle
 * @param {OutputBundle} bundle
 * @returns {Set<string>}
 */
export function takeBundledFilesNames (bundle: OutputBundle): Set<string> {
	const bundledFilenames: Set<string> = new Set();
	Object.values(bundle).forEach(value => {
		if (isOutputChunk(value)) {
			Object.keys(value.modules).forEach(fileName => bundledFilenames.add(fileName));
		}

		else {
			bundledFilenames.add(value.fileName);
		}
	});
	return bundledFilenames;
}