import {EnumDeclaration, SourceFile, updateEnumDeclaration} from "typescript";
import {removeExportModifier} from "../util/util";
import {hasReferences} from "../reference/has-references";
import {preserveExport} from "../reference/preserve-export";
import {IReferenceCache} from "../cache/i-reference-cache";

/**
 * Visits an EnumDeclaration that has an export modifier in front of it.
 * @param {EnumDeclaration} node
 * @param {Set<string>} usedExports
 * @param {SourceFile} sourceFile
 * @param {IReferenceCache} cache
 * @returns {Node | undefined}
 */
export function visitEnumDeclarationWithExportModifier (node: EnumDeclaration, usedExports: Set<string>, sourceFile: SourceFile, cache: IReferenceCache): EnumDeclaration|undefined {
	if (!hasReferences(node, usedExports, sourceFile, cache)) {
		return undefined;
	}

	else if (!preserveExport(node, usedExports, cache)) {
		return updateEnumDeclaration(
			node,
			node.decorators,
			removeExportModifier(node.modifiers),
			node.name,
			node.members
		);
	}

	else {
		return node;
	}
}