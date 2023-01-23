import type {TS} from "../../../../../../type/ts.js";
import type {EnsureNoExportModifierTransformerVisitorOptions} from "../ensure-no-export-modifier-transformer-visitor-options.js";
import {preserveMeta} from "../../../util/clone-node-with-meta.js";
import {hasExportModifier, removeExportModifier} from "../../../util/modifier-util.js";
import {getModifierLikes} from "../../../util/node-util.js";

export function visitFunctionDeclaration(options: EnsureNoExportModifierTransformerVisitorOptions<TS.FunctionDeclaration>): TS.FunctionDeclaration {
	const {node, factory, typescript} = options;
	if (!hasExportModifier(node, typescript)) return node;

	const modifierLikes = removeExportModifier(getModifierLikes(node), typescript);

	return preserveMeta(
		factory.updateFunctionDeclaration(node, modifierLikes, node.asteriskToken, node.name, node.typeParameters, node.parameters, node.type, node.body),
		node,
		options
	);
}
