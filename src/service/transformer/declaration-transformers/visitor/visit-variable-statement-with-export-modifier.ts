import {removeExportModifier} from "../util/util";
import {SourceFile, updateVariableStatement, VariableStatement} from "typescript";
import {hasReferences} from "../reference/has-references";
import {preserveExport} from "../reference/preserve-export";
import {IReferenceCache} from "../cache/i-reference-cache";

/**
 * Visits a VariableStatement that has an export modifier in front of it.
 * @param {Node} node
 * @param {Set<string>} usedExports
 * @param {SourceFile} sourceFile
 * @param {IReferenceCache} cache
 * @returns {Node | undefined}
 */
export function visitVariableStatementWithExportModifier (node: VariableStatement, usedExports: Set<string>, sourceFile: SourceFile, cache: IReferenceCache): VariableStatement|undefined {
	if (!hasReferences(node, usedExports, sourceFile, cache)) {
		return undefined;
	}

	else if (!preserveExport(node, usedExports, cache)) {
		// Otherwise, change its' name so that it follows the alias
		return updateVariableStatement(
			node,
			removeExportModifier(node.modifiers),
			node.declarationList
		);
	}

	else {
		return node;
	}
}