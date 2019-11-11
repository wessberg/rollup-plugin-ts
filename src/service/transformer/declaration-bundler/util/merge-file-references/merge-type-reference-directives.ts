import {FileReference, SourceFile} from "typescript";

function formatTypeReferenceDirective(fileName: string): string {
	return `/// <reference types="${fileName}" />`;
}

/**
 * Merges the type file references of the SourceFile
 * @param {SourceFile} sourceFile
 * @return {FileReference[]}
 */
export function mergeTypeReferenceDirectives(sourceFile: SourceFile): FileReference[] {
	return (
		[...new Set<string>(sourceFile.typeReferenceDirectives.map(({fileName}) => fileName))]
			// Don't include those that are already part of the SourceFile
			.filter(fileName => !sourceFile.text.includes(formatTypeReferenceDirective(fileName)))
			.map(fileName => ({
				fileName,
				pos: -1,
				end: -1
			}))
	);
}
