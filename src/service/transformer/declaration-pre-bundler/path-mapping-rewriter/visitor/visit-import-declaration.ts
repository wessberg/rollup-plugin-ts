import {createStringLiteral, ImportDeclaration, isStringLiteralLike, updateImportDeclaration} from "typescript";
import {PathMappingRewriterVisitorOptions} from "../path-mapping-rewriter-visitor-options";
import {dirname, relative} from "path";
import {ensureHasLeadingDotAndPosix, stripKnownExtension} from "../../../../../util/path/path-util";
import {NODE_MODULES} from "../../../../../constant/constant";

/**
 * Visits the given ImportDeclaration.
 * @param {UpdateExportsVisitorOptions<ImportDeclaration>} options
 * @returns {ImportDeclaration}
 */
export function visitImportDeclaration({node, resolver, sourceFile}: PathMappingRewriterVisitorOptions<ImportDeclaration>): ImportDeclaration {
	const specifier = node.moduleSpecifier;
	if (specifier == null || !isStringLiteralLike(specifier)) return node;

	const resolved = resolver(specifier.text, sourceFile.fileName);
	if (resolved == null) return node;

	const relativeToSourceFileDirectory = relative(dirname(sourceFile.fileName), resolved);
	const updatedModuleSpecifierText = ensureHasLeadingDotAndPosix(stripKnownExtension(relativeToSourceFileDirectory), false);

	// If the text didn't change, leave the node as it is
	if (specifier.text === updatedModuleSpecifierText || updatedModuleSpecifierText.includes(`/${NODE_MODULES}/`)) return node;

	// Otherwise, update the module specifier to reflect the actual file path
	return updateImportDeclaration(node, node.decorators, node.modifiers, node.importClause, createStringLiteral(updatedModuleSpecifierText));
}
