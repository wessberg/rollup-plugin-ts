import {TS} from "../../../../../../type/ts";
import {InlineNamespaceModuleBlockVisitorOptions} from "../inline-namespace-module-block-visitor-options";
import {cloneNodeWithMeta} from "../../../util/clone-node-with-meta";

export function visitModuleDeclaration(options: InlineNamespaceModuleBlockVisitorOptions<TS.ModuleDeclaration>): undefined {
	const {node, intentToAddModuleDeclaration} = options;
	intentToAddModuleDeclaration(cloneNodeWithMeta(node, options));

	return undefined;
}
