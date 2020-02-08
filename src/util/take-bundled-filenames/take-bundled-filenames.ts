import {OutputBundle} from "rollup";
import {isOutputChunk} from "../is-output-chunk/is-output-chunk";
import {normalize} from "../path/path-util";

/**
 * Takes all filenames that has been included in the given bundle
 */
export function takeBundledFilesNames(bundle: OutputBundle): Set<string> {
	const bundledFilenames: Set<string> = new Set();
	Object.values(bundle).forEach(value => {
		if (isOutputChunk(value)) {
			Object.keys(value.modules).forEach(fileName => bundledFilenames.add(normalize(fileName)));
		} else {
			bundledFilenames.add(normalize(value.fileName));
		}
	});
	return bundledFilenames;
}
