import {TS} from "../../../../../../../type/ts";
import {ModifierFinalizerVisitorOptions} from "../modifier-finalizer-visitor-options";
import {removeExportModifier} from "../../../../../declaration-pre-bundler/util/modifier/modifier-util";

export function visitTypeAliasDeclaration({node, typescript}: ModifierFinalizerVisitorOptions<TS.TypeAliasDeclaration>): TS.TypeAliasDeclaration {
	return typescript.updateTypeAliasDeclaration(
		node,
		node.decorators,
		removeExportModifier(node.modifiers, typescript),
		node.name,
		node.typeParameters,
		node.type
	);
}
