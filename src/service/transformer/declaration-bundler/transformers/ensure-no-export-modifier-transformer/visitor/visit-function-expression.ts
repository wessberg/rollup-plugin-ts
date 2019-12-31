import {TS} from "../../../../../../type/ts";
import {EnsureNoExportModifierTransformerVisitorOptions} from "../ensure-no-export-modifier-transformer-visitor-options";
import {preserveSymbols} from "../../../util/clone-node-with-symbols";
import {hasExportModifier, removeExportModifier} from "../../../util/modifier-util";

export function visitFunctionExpression(options: EnsureNoExportModifierTransformerVisitorOptions<TS.FunctionExpression>): TS.FunctionExpression {
	const {node, typescript} = options;
	if (!hasExportModifier(node, typescript)) return node;

	return preserveSymbols(
		typescript.updateFunctionExpression(
			node,
			removeExportModifier(node.modifiers, typescript),
			node.asteriskToken,
			node.name,
			node.typeParameters,
			node.parameters,
			node.type,
			node.body
		),
		options
	);
}
