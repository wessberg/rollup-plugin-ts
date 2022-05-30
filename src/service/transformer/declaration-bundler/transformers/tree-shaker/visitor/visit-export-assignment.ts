import {TreeShakerVisitorOptions} from "../tree-shaker-visitor-options.js";
import {TS} from "../../../../../../type/ts.js";

export function visitExportAssignment({node}: TreeShakerVisitorOptions<TS.ExportAssignment>): TS.ExportAssignment | undefined {
	return node;
}
