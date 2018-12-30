import {removeExportModifier} from "../util/util";
import {FunctionDeclaration, updateFunctionDeclaration} from "typescript";
import {hasReferences} from "../reference/has-references";
import {preserveExport} from "../reference/preserve-export";
import {VisitorOptions} from "./visitor-options";

/**
 * Visits a FunctionDeclaration that has an export modifier in front of it.
 * @param {VisitorOptions<FunctionDeclaration>} options
 * @returns {Node | undefined}
 */
export function visitFunctionDeclarationWithExportModifier ({node, usedExports, cache, sourceFile, chunkToOriginalFileMap}: VisitorOptions<FunctionDeclaration>): FunctionDeclaration|undefined {
	if (!hasReferences(node, usedExports, sourceFile, cache, chunkToOriginalFileMap)) {
		return undefined;
	}

	else if (!preserveExport(node, usedExports, cache) && chunkToOriginalFileMap.size < 2) {
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