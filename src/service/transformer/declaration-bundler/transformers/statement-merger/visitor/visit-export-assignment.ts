import {TS} from "../../../../../../type/ts";
import {StatementMergerVisitorOptions} from "../statement-merger-visitor-options";

export function visitExportAssignment(
	options: StatementMergerVisitorOptions<TS.ExportAssignment>
): TS.ExportDeclaration[] | TS.ExportDeclaration | TS.ExportAssignment | undefined {
	const {node, typescript} = options;

	// If the Expression isn't an identifier, leave the node as it is
	if (!typescript.isIdentifier(node.expression)) {
		return node;
	}

	// Otherwise, replace this ExportDeclaration with merged exports from the module
	return options.preserveExportedModuleIfNeeded(undefined, false);
}
