import {InterfaceDeclaration, updateInterfaceDeclaration} from "typescript";
import {removeExportModifier} from "../util/util";
import {hasReferences} from "../reference/has-references";
import {preserveExport} from "../reference/preserve-export";
import {VisitorOptions} from "./visitor-options";

/**
 * Visits an InterfaceDeclaration that has an export modifier in front of it.
 * @param {VisitorOptions<InterfaceDeclaration>} options
 * @returns {Node | undefined}
 */
export function visitInterfaceDeclarationWithExportModifier({
	node,
	usedExports,
	sourceFile,
	cache,
	chunkToOriginalFileMap,
	continuation
}: VisitorOptions<InterfaceDeclaration>): InterfaceDeclaration | undefined {
	if (!hasReferences(node, usedExports, sourceFile, cache, chunkToOriginalFileMap)) {
		return undefined;
	} else if (!preserveExport(node, usedExports, cache)) {
		return updateInterfaceDeclaration(node, node.decorators, removeExportModifier(node.modifiers), node.name, node.typeParameters, node.heritageClauses, node.members.map(continuation));
	} else {
		return continuation(node);
	}
}
