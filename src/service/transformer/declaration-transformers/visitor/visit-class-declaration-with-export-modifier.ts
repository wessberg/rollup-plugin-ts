import {ClassDeclaration, SourceFile, updateClassDeclaration} from "typescript";
import {removeExportModifier} from "../util/util";
import {hasReferences} from "../reference/has-references";
import {preserveExport} from "../reference/preserve-export";
import {IReferenceCache} from "../cache/i-reference-cache";

/**
 * Visits an ClassDeclaration that has an export modifier in front of it.
 * @param {ClassDeclaration} node
 * @param {Set<string>} usedExports
 * @param {SourceFile} sourceFile
 * @param {IReferenceCache} cache
 * @returns {Node | undefined}
 */
export function visitClassDeclarationWithExportModifier (node: ClassDeclaration, usedExports: Set<string>, sourceFile: SourceFile, cache: IReferenceCache): ClassDeclaration|undefined {
	if (!hasReferences(node, usedExports, sourceFile, cache)) {
		return undefined;
	}

	else if (!preserveExport(node, usedExports, cache)) {
		return updateClassDeclaration(
			node,
			node.decorators,
			removeExportModifier(node.modifiers),
			node.name,
			node.typeParameters,
			node.heritageClauses,
			node.members
		);
	}

	else {
		return node;
	}
}