import {TS} from "../../../../../../../type/ts";
import {ModifierFinalizerVisitorOptions} from "../modifier-finalizer-visitor-options";
import {removeExportModifier} from "../../../../../declaration-pre-bundler/util/modifier/modifier-util";

export function visitInterfaceDeclaration({node, typescript}: ModifierFinalizerVisitorOptions<TS.InterfaceDeclaration>): TS.InterfaceDeclaration {
	return typescript.updateInterfaceDeclaration(
		node,
		node.decorators,
		removeExportModifier(node.modifiers, typescript),
		node.name,
		node.typeParameters,
		node.heritageClauses,
		node.members
	);
}
