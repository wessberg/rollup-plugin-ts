import {TS} from "../../../../../../type/ts";
import {EnsureNoExportModifierTransformerVisitorOptions} from "../ensure-no-export-modifier-transformer-visitor-options";
import {preserveMeta} from "../../../util/clone-node-with-meta";
import {hasExportModifier, removeExportModifier} from "../../../util/modifier-util";

export function visitModuleDeclaration(options: EnsureNoExportModifierTransformerVisitorOptions<TS.ModuleDeclaration>): TS.ModuleDeclaration {
	const {node, compatFactory, typescript} = options;
	if (!hasExportModifier(node, typescript)) return node;
	return preserveMeta(compatFactory.updateModuleDeclaration(node, node.decorators, removeExportModifier(node.modifiers, typescript), node.name, node.body), node, options);
}
