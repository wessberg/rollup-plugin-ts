import {removeExportModifier} from "../util/util";
import {updateVariableStatement, VariableStatement} from "typescript";
import {hasReferences} from "../reference/has-references";
import {preserveExport} from "../reference/preserve-export";
import {VisitorOptions} from "./visitor-options";

/**
 * Visits a VariableStatement that has an export modifier in front of it.
 * @param {VisitorOptions<VariableStatement>} options
 * @returns {Node | undefined}
 */
export function visitVariableStatementWithExportModifier ({node, usedExports, sourceFile, cache, chunkToOriginalFileMap}: VisitorOptions<VariableStatement>): VariableStatement|undefined {
	if (!hasReferences(node, usedExports, sourceFile, cache, chunkToOriginalFileMap)) {
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