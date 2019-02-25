import {ExportAssignment, VariableStatement} from "typescript";
import {AfterDeclarationsVisitorOptions} from "../after-declarations-visitor-options";

/**
 * Visits the given ExportAssignment.
 * @param {AfterDeclarationsVisitorOptions<ExportAssignment>} options
 * @returns {ExportAssignment | VariableStatement | undefined}
 */
export function visitExportAssignment({node, isEntry}: AfterDeclarationsVisitorOptions<ExportAssignment>): ExportAssignment | VariableStatement | undefined {
	// Only preserve the node if it is part of the entry file for the chunk
	if (isEntry) {
		return node;
	}

	return undefined;
}
