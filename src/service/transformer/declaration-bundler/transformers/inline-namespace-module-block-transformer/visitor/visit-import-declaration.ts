import {TS} from "../../../../../../type/ts";
import {InlineNamespaceModuleBlockVisitorOptions} from "../inline-namespace-module-block-visitor-options";
import {cloneNodeWithMeta} from "../../../util/clone-node-with-meta";

export function visitImportDeclaration(options: InlineNamespaceModuleBlockVisitorOptions<TS.ImportDeclaration>): undefined {
	const {node, intentToAddImportDeclaration} = options;
	intentToAddImportDeclaration(cloneNodeWithMeta(node, options));

	return undefined;
}
