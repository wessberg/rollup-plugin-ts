import {ExportAssignment, VariableStatement} from "typescript";
import {UpdateExportsVisitorOptions} from "../update-exports-visitor-options";

/**
 * Visits the given ExportAssignment.
 * @param {UpdateExportsVisitorOptions<ExportAssignment>} options
 * @returns {ExportAssignment | VariableStatement | undefined}
 */
export function visitExportAssignment({node, isEntry}: UpdateExportsVisitorOptions<ExportAssignment>): ExportAssignment | VariableStatement | undefined {
	// Only preserve the node if it is part of the entry file for the chunk
	if (isEntry) {
		return node;
	}

	return undefined;
}
