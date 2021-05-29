import path from "crosspath";

export interface PreparePathsOptions {
	fileName: string;
	relativeOutDir: string;
	absoluteOutDir: string;
}

export interface PathsResult {
	fileName: string;
	relative: string;
	absolute: string;
}

export function preparePaths({relativeOutDir, absoluteOutDir, fileName}: PreparePathsOptions): PathsResult {
	const absolutePath = path.join(absoluteOutDir, fileName);
	const relativePath = path.join(relativeOutDir, fileName);

	return {
		fileName,
		absolute: absolutePath,
		relative: relativePath
	};
}
