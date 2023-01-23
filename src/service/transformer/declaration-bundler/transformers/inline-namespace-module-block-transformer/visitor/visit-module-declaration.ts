import type {TS} from "../../../../../../type/ts.js";
import type {InlineNamespaceModuleBlockVisitorOptions} from "../inline-namespace-module-block-visitor-options.js";
import {cloneNodeWithMeta} from "../../../util/clone-node-with-meta.js";

export function visitModuleDeclaration(options: InlineNamespaceModuleBlockVisitorOptions<TS.ModuleDeclaration>): undefined {
	const {node, intentToAddModuleDeclaration} = options;
	intentToAddModuleDeclaration(cloneNodeWithMeta(node, options));

	return undefined;
}
