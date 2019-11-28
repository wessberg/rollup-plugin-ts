import {TS} from "../../../../../../../type/ts";
import {ModifierFinalizerVisitorOptions} from "../modifier-finalizer-visitor-options";
import {ensureHasDeclareModifier, removeExportModifier} from "../../../../../declaration-pre-bundler/util/modifier/modifier-util";

export function visitVariableStatement({node, typescript}: ModifierFinalizerVisitorOptions<TS.VariableStatement>): TS.VariableStatement {
	return typescript.updateVariableStatement(
		node,
		ensureHasDeclareModifier(removeExportModifier(node.modifiers, typescript), typescript),
		node.declarationList
	);
}
