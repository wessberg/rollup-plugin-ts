import {TS} from "../../../../type/ts";

function formatLibReferenceDirective(libName: string): string {
	return `/// <reference lib="${libName}" />`;
}

/**
 * Merges the lib file references of the SourceFile
 */
export function mergeLibReferenceDirectives(sourceFile: TS.SourceFile): TS.FileReference[] {
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
