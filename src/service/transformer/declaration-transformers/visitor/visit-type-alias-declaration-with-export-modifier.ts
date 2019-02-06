import {TypeAliasDeclaration, updateTypeAliasDeclaration} from "typescript";
import {removeExportModifier} from "../util/util";
import {hasReferences} from "../reference/has-references";
import {preserveExport} from "../reference/preserve-export";
import {VisitorOptions} from "./visitor-options";

/**
 * Visits a TypeAliasDeclaration that has an export modifier in front of it.
 * @param {VisitorOptions<TypeAliasDeclaration>} options
 * @returns {Node | undefined}
 */
export function visitTypeAliasDeclarationWithExportModifier({
	node,
	usedExports,
	sourceFile,
	cache,
	chunkToOriginalFileMap,
	continuation
}: VisitorOptions<TypeAliasDeclaration>): TypeAliasDeclaration | undefined {
	if (!hasReferences(node, usedExports, sourceFile, cache, chunkToOriginalFileMap)) {
		return undefined;
	} else if (!preserveExport(node, usedExports, cache)) {
		return updateTypeAliasDeclaration(node, node.decorators, removeExportModifier(node.modifiers), node.name, node.typeParameters, continuation(node.type));
	}

	return continuation(node);
}
