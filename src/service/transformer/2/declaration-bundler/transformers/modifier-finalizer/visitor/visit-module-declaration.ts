import {TS} from "../../../../../../../type/ts";
import {ModifierFinalizerVisitorOptions} from "../modifier-finalizer-visitor-options";
import {ensureHasDeclareModifier, removeExportModifier} from "../../../../../declaration-pre-bundler/util/modifier/modifier-util";

export function visitModuleDeclaration({node, typescript}: ModifierFinalizerVisitorOptions<TS.ModuleDeclaration>): TS.ModuleDeclaration {
	return typescript.updateModuleDeclaration(
		node,
		node.decorators,
		ensureHasDeclareModifier(removeExportModifier(node.modifiers, typescript), typescript),
		node.name,
		node.body
	);
}
