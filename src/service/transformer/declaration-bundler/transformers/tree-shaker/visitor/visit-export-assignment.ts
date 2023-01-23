import type {TreeShakerVisitorOptions} from "../tree-shaker-visitor-options.js";
import type {TS} from "../../../../../../type/ts.js";

export function visitExportAssignment({node}: TreeShakerVisitorOptions<TS.ExportAssignment>): TS.ExportAssignment | undefined {
	return node;
}
