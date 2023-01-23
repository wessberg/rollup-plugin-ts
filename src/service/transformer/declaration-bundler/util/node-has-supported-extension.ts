import path from "crosspath";
import type {KnownExtension} from "../../../../constant/constant.js";
import type {TS} from "../../../../type/ts.js";
import type {SupportedExtensions} from "../../../../util/get-supported-extensions/get-supported-extensions.js";

export function nodeHasSupportedExtension<T extends TS.ImportDeclaration | TS.ExportDeclaration | TS.Statement>(
	node: T,
	typescript: typeof TS,
	extensions: SupportedExtensions
): boolean {
	// Allow nodes for which there are no module specifiers or in case they aren't string literals for some reason.
	if (!("moduleSpecifier" in node)) return true;
	if (node.moduleSpecifier == null || !typescript.isStringLiteralLike(node.moduleSpecifier)) return true;

	return path.extname(node.moduleSpecifier.text) === "" || extensions.has(path.extname(node.moduleSpecifier.text) as KnownExtension);
}
