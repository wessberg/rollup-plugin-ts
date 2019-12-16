import {TreeShakerVisitorOptions} from "../tree-shaker-visitor-options";
import {TS} from "../../../../../../type/ts";

export function visitExportAssignment({node}: TreeShakerVisitorOptions<TS.ExportAssignment>): TS.ExportAssignment | undefined {
	return node;
}
