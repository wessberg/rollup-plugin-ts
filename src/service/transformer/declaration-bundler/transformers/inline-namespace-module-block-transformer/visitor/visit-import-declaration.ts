import {TS} from "../../../../../../type/ts.js";
import {InlineNamespaceModuleBlockVisitorOptions} from "../inline-namespace-module-block-visitor-options.js";
import {cloneNodeWithMeta} from "../../../util/clone-node-with-meta.js";

export function visitImportDeclaration(options: InlineNamespaceModuleBlockVisitorOptions<TS.ImportDeclaration>): undefined {
	const {node, intentToAddImportDeclaration} = options;
	intentToAddImportDeclaration(cloneNodeWithMeta(node, options));

	return undefined;
}
