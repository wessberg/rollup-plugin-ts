import {TS} from "../../../../../../../type/ts";
import {ModifierFinalizerVisitorOptions} from "../modifier-finalizer-visitor-options";
import {ensureHasDeclareModifier, removeExportModifier} from "../../../../../declaration-pre-bundler/util/modifier/modifier-util";

export function visitClassDeclaration({node, typescript}: ModifierFinalizerVisitorOptions<TS.ClassDeclaration>): TS.ClassDeclaration {
	return typescript.updateClassDeclaration(
		node,
		node.decorators,
		ensureHasDeclareModifier(removeExportModifier(node.modifiers, typescript), typescript),
		node.name,
		node.typeParameters,
		node.heritageClauses,
		node.members
	);
}
