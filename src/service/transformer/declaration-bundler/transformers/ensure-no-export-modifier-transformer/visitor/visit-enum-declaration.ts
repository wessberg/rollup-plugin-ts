import {TS} from "../../../../../../type/ts.js";
import {EnsureNoExportModifierTransformerVisitorOptions} from "../ensure-no-export-modifier-transformer-visitor-options.js";
import {preserveMeta} from "../../../util/clone-node-with-meta.js";
import {hasExportModifier, removeExportModifier} from "../../../util/modifier-util.js";

export function visitEnumDeclaration(options: EnsureNoExportModifierTransformerVisitorOptions<TS.EnumDeclaration>): TS.EnumDeclaration {
	const {node, factory, typescript} = options;
	if (!hasExportModifier(node, typescript)) return node;
	return preserveMeta(factory.updateEnumDeclaration(node, node.decorators, removeExportModifier(node.modifiers, typescript), node.name, node.members), node, options);
}
