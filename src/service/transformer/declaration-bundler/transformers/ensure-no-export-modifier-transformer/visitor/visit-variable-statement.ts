import {TS} from "../../../../../../type/ts";
import {EnsureNoExportModifierTransformerVisitorOptions} from "../ensure-no-export-modifier-transformer-visitor-options";
import {preserveMeta} from "../../../util/clone-node-with-meta";
import {hasExportModifier, removeExportModifier} from "../../../util/modifier-util";

export function visitVariableStatement(options: EnsureNoExportModifierTransformerVisitorOptions<TS.VariableStatement>): TS.VariableStatement {
	const {node, compatFactory, typescript} = options;
	if (!hasExportModifier(node, typescript)) return node;

	return preserveMeta(compatFactory.updateVariableStatement(node, removeExportModifier(node.modifiers, typescript), node.declarationList), node, options);
}
