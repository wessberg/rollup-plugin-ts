import {EnumDeclaration, updateEnumDeclaration} from "typescript";
import {removeExportModifier} from "../util/util";
import {hasReferences} from "../reference/has-references";
import {preserveExport} from "../reference/preserve-export";
import {VisitorOptions} from "./visitor-options";

/**
 * Visits an EnumDeclaration that has an export modifier in front of it.
 * @param {VisitorOptions<EnumDeclaration>} options
 * @returns {Node | undefined}
 */
export function visitEnumDeclarationWithExportModifier ({node, usedExports, sourceFile, cache}: VisitorOptions<EnumDeclaration>): EnumDeclaration|undefined {
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