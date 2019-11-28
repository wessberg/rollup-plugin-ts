import {PathMappingRewriterVisitorOptions} from "../path-mapping-rewriter-visitor-options";
import {dirname, relative} from "path";
import {ensureHasLeadingDotAndPosix, stripKnownExtension} from "../../../../../util/path/path-util";
import {NODE_MODULES} from "../../../../../constant/constant";
import {TS} from "../../../../../type/ts";

/**
 * Visits the given ImportDeclaration.
 */
export function visitImportDeclaration({
	node,
	resolver,
	sourceFile,
	typescript
}: PathMappingRewriterVisitorOptions<TS.ImportDeclaration>): TS.ImportDeclaration {
	const specifier = node.moduleSpecifier;
	if (specifier == null || !typescript.isStringLiteralLike(specifier)) return node;

	const resolved = resolver(specifier.text, sourceFile.fileName);
	if (resolved == null) return node;

	const relativeToSourceFileDirectory = relative(dirname(sourceFile.fileName), resolved);
	const updatedModuleSpecifierText = ensureHasLeadingDotAndPosix(stripKnownExtension(relativeToSourceFileDirectory), false);

	// If the text didn't change, leave the node as it is
	if (specifier.text === updatedModuleSpecifierText || updatedModuleSpecifierText.includes(`/${NODE_MODULES}/`)) return node;

	// Otherwise, update the module specifier to reflect the actual file path
	return typescript.updateImportDeclaration(
		node,
		node.decorators,
		node.modifiers,
		node.importClause,
		typescript.createStringLiteral(updatedModuleSpecifierText)
	);
}
