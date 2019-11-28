import {TS} from "../../../../../../../type/ts";
import {ModifierFinalizerVisitorOptions} from "../modifier-finalizer-visitor-options";
import {ensureHasDeclareModifier, removeExportModifier} from "../../../../../declaration-pre-bundler/util/modifier/modifier-util";

export function visitFunctionDeclaration({node, typescript}: ModifierFinalizerVisitorOptions<TS.FunctionDeclaration>): TS.FunctionDeclaration {
	return typescript.updateFunctionDeclaration(
		node,
		node.decorators,
		ensureHasDeclareModifier(removeExportModifier(node.modifiers, typescript), typescript),
		node.asteriskToken,
		node.name,
		node.typeParameters,
		node.parameters,
		node.type,
		node.body
	);
}
