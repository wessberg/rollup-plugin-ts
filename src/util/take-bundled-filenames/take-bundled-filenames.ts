import {OutputBundle} from "rollup";
import {isOutputChunk} from "../is-output-chunk/is-output-chunk";
import path from "crosspath";

/**
 * Takes all filenames that has been included in the given bundle
 */
export function takeBundledFilesNames(bundle: OutputBundle): Set<string> {
	const bundledFilenames: Set<string> = new Set();
	Object.values(bundle).forEach(value => {
		if (isOutputChunk(value)) {
			Object.keys(value.modules).forEach(fileName => bundledFilenames.add(path.normalize(fileName)));
		} else if ("fileName" in value) {
			bundledFilenames.add(path.normalize(value.fileName));
		}
	});
	return bundledFilenames;
}
