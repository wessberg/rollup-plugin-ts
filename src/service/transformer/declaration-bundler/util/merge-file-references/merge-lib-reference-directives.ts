import {FileReference, SourceFile} from "typescript";

function formatLibReferenceDirective(libName: string): string {
	return `/// <reference lib="${libName}" />`;
}

/**
 * Merges the lib file references of the SourceFile
 * @param {SourceFile} sourceFile
 * @return {FileReference[]}
 */
export function mergeLibReferenceDirectives(sourceFile: SourceFile): FileReference[] {
	return (
		[...new Set<string>(sourceFile.libReferenceDirectives.map(({fileName}) => fileName))]
			// Don't include those that are already part of the SourceFile
			.filter(fileName => !sourceFile.text.includes(formatLibReferenceDirective(fileName)))
			.map(fileName => ({
				fileName,
				pos: -1,
				end: -1
			}))
	);
}
