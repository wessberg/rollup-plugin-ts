import {ClassDeclaration, updateClassDeclaration} from "typescript";
import {removeExportModifier} from "../util/util";
import {hasReferences} from "../reference/has-references";
import {preserveExport} from "../reference/preserve-export";
import {VisitorOptions} from "./visitor-options";

/**
 * Visits an ClassDeclaration that has an export modifier in front of it.
 * @param {VisitorOptions<ClassDeclaration>} options
 * @returns {Node | undefined}
 */
export function visitClassDeclarationWithExportModifier({node, usedExports, sourceFile, chunkToOriginalFileMap, cache, continuation}: VisitorOptions<ClassDeclaration>): ClassDeclaration | undefined {
	if (!hasReferences(node, usedExports, sourceFile, cache, chunkToOriginalFileMap)) {
		return undefined;
	} else if (!preserveExport(node, usedExports, cache)) {
		return updateClassDeclaration(
			node,
			node.decorators,
			removeExportModifier(node.modifiers),
			node.name,
			node.typeParameters == null ? undefined : node.typeParameters.map(continuation),
			node.heritageClauses == null ? undefined : node.heritageClauses.map(continuation),
			node.members.map(continuation)
		);
	} else {
		return continuation(node);
	}
}
