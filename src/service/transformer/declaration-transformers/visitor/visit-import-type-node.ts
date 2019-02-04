import {createLiteralTypeNode, createStringLiteral, ImportTypeNode, isLiteralTypeNode, isStringLiteralLike, Node, updateImportTypeNode} from "typescript";
import {ensureHasLeadingDot, ensureRelative, isExternalLibrary, stripExtension} from "../../../../util/path/path-util";
import {VisitorOptions} from "./visitor-options";
import {dirname, join} from "path";
import {matchModuleSpecifier} from "../../../../util/match-module-specifier/match-module-specifier";

/**
 * Visits the given ImportTypeNode.
 * @param {VisitorOptions<ImportTypeNode>} options
 * @returns {ImportTypeNode | undefined}
 */
export function visitImportTypeNode({node, entryFileName, supportedExtensions, moduleNames, chunkToOriginalFileMap, outFileName}: VisitorOptions<ImportTypeNode>): Node | undefined {
	// If nothing is imported from the module, or if the Import is importing things that are already part of this chunk, don't include it. Everything will already be part of the SourceFile
	if (!isLiteralTypeNode(node.argument) || !isStringLiteralLike(node.argument.literal)) return node;

	if (isExternalLibrary(node.argument.literal.text)) {
		return node;
	} else {
		// Compute the absolute path
		const absoluteModuleSpecifier = join(dirname(entryFileName), node.argument.literal.text);
		// If the path that it imports from is already part of this chunk, Include only the qualifier
		const match = matchModuleSpecifier(absoluteModuleSpecifier, supportedExtensions, moduleNames);

		if (match != null) {
			// Return only the Qualifier
			return node.qualifier;
		}

		// Otherwise, assume that it is being imported from a generated chunk. Try to find it
		const matchInChunks = [...chunkToOriginalFileMap.entries()].find(
			([, originals]) => originals.find(original => matchModuleSpecifier(absoluteModuleSpecifier, supportedExtensions, [original]) != null) != null
		);

		// If nothing was found, use only the Qualifier
		if (matchInChunks == null || stripExtension(outFileName) === stripExtension(matchInChunks[0])) {
			return node.qualifier;
		} else {
			// Otherwise, compute a relative path and update the moduleSpecifier
			return updateImportTypeNode(
				node,
				createLiteralTypeNode(createStringLiteral(ensureHasLeadingDot(stripExtension(ensureRelative(dirname(outFileName), matchInChunks[0]))))),
				node.qualifier,
				node.typeArguments,
				node.isTypeOf
			);
		}
	}
}
