import {Expression, isStringLiteralLike} from "typescript";
import {getExtension, setExtension} from "../path/path-util";

/**
 * Matches the given ModuleSpecifier within the given filenames, depending on the given supported extensions
 * @param {string|Expression?} moduleSpecifier
 * @param {string[]} supportedExtensions
 * @param {string[]} fileNames
 * @return {boolean}
 */
export function matchModuleSpecifier(moduleSpecifier: string | Expression | undefined, supportedExtensions: string[], fileNames: string[]): string | undefined {
	if (moduleSpecifier == null || (typeof moduleSpecifier !== "string" && !isStringLiteralLike(moduleSpecifier))) return undefined;

	const text = typeof moduleSpecifier === "string" ? moduleSpecifier : moduleSpecifier.text;

	// If it already has an extension, try to find an exact match
	if (getExtension(text) !== "") return fileNames.find(fileName => fileName === text);

	// Otherwise, try for each extension
	for (const extension of supportedExtensions) {
		const joined = setExtension(text, extension);
		const match = fileNames.find(fileName => fileName === joined);
		if (match != null) return match;
	}
	return undefined;
}
