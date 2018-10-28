import {removeExportModifier} from "../util/util";
import {FunctionDeclaration, SourceFile, updateFunctionDeclaration} from "typescript";
import {hasReferences} from "../reference/has-references";
import {preserveExport} from "../reference/preserve-export";
import {IReferenceCache} from "../cache/i-reference-cache";

/**
 * Visits a FunctionDeclaration that has an export modifier in front of it.
 * @param {Node} node
 * @param {Set<string>} usedExports
 * @param {SourceFile} sourceFile
 * @param {IReferenceCache} cache
 * @returns {Node | undefined}
 */
export function visitFunctionDeclarationWithExportModifier (node: FunctionDeclaration, usedExports: Set<string>, sourceFile: SourceFile, cache: IReferenceCache): FunctionDeclaration|undefined {
	if (!hasReferences(node, usedExports, sourceFile, cache)) {
		return undefined;
	}

	else if (!preserveExport(node, usedExports, cache)) {
		return updateFunctionDeclaration(
			node,
			node.decorators,
			removeExportModifier(node.modifiers),
			node.asteriskToken,
			node.name,
			node.typeParameters,
			node.parameters,
			node.type,
			node.body
		);
	}

	else {
		return node;
	}
}