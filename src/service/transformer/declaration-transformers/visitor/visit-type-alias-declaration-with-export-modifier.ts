import {SourceFile, TypeAliasDeclaration, updateTypeAliasDeclaration} from "typescript";
import {removeExportModifier} from "../util/util";
import {hasReferences} from "../reference/has-references";
import {preserveExport} from "../reference/preserve-export";
import {IReferenceCache} from "../cache/i-reference-cache";

/**
 * Visits a TypeAliasDeclaration that has an export modifier in front of it.
 * @param {TypeAliasDeclaration} node
 * @param {Set<string>} usedExports
 * @param {SourceFile} sourceFile
 * @param {IReferenceCache} cache
 * @returns {Node | undefined}
 */
export function visitTypeAliasDeclarationWithExportModifier (node: TypeAliasDeclaration, usedExports: Set<string>, sourceFile: SourceFile, cache: IReferenceCache): TypeAliasDeclaration|undefined {
	if (!hasReferences(node, usedExports, sourceFile, cache)) {
		return undefined;
	}

	else if (!preserveExport(node, usedExports, cache)) {
		return updateTypeAliasDeclaration(
			node,
			node.decorators,
			removeExportModifier(node.modifiers),
			node.name,
			node.typeParameters,
			node.type
		);
	}

	return node;
}