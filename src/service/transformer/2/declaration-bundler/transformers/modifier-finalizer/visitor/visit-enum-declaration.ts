import {TS} from "../../../../../../../type/ts";
import {ModifierFinalizerVisitorOptions} from "../modifier-finalizer-visitor-options";
import {removeExportModifier} from "../../../../../declaration-pre-bundler/util/modifier/modifier-util";

export function visitEnumDeclaration({node, typescript}: ModifierFinalizerVisitorOptions<TS.EnumDeclaration>): TS.EnumDeclaration {
	return typescript.updateEnumDeclaration(node, node.decorators, removeExportModifier(node.modifiers, typescript), node.name, node.members);
}
