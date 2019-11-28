import {TS} from "../../../../../../../type/ts";
import {ModifierFinalizerVisitorOptions} from "../modifier-finalizer-visitor-options";
import {ensureHasDeclareModifier, removeExportModifier} from "../../../../../declaration-pre-bundler/util/modifier/modifier-util";

export function visitClassExpression({node, typescript}: ModifierFinalizerVisitorOptions<TS.ClassExpression>): TS.ClassExpression {
	return typescript.updateClassExpression(
		node,
		ensureHasDeclareModifier(removeExportModifier(node.modifiers, typescript), typescript),
		node.name,
		node.typeParameters,
		node.heritageClauses,
		node.members
	);
}
