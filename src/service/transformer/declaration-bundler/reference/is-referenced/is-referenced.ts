import {forEachChild, isArrayBindingPattern, isBindingElement, isClassDeclaration, isClassExpression, isEnumDeclaration, isExportAssignment, isExportDeclaration, isExportSpecifier, isFunctionDeclaration, isFunctionExpression, isGetAccessorDeclaration, isIdentifier, isInterfaceDeclaration, isMethodDeclaration, isMethodSignature, isModuleDeclaration, isObjectBindingPattern, isParameter, isPropertyDeclaration, isPropertySignature, isSetAccessorDeclaration, isSourceFile, isTypeAliasDeclaration, isVariableDeclaration, isVariableDeclarationList, isVariableStatement, Node} from "typescript";
import {IsReferencedOptions} from "./is-referenced-options";
import {nodeContainsChild} from "../../util/node-contains-child";
import {getIdentifiersForNode} from "../../util/get-identifiers-for-node";
import {ReferenceVisitorOptions} from "./reference-visitor-options";
import {checkClassDeclaration} from "./visitor/check-class-declaration";
import {checkIdentifier} from "./visitor/check-identifier";
import {checkClassExpression} from "./visitor/check-class-expression";
import {checkInterfaceDeclaration} from "./visitor/check-interface-declaration";
import {checkEnumDeclaration} from "./visitor/check-enum-declaration";
import {checkTypeAliasDeclaration} from "./visitor/check-type-alias-declaration";
import {checkFunctionDeclaration} from "./visitor/check-function-declaration";
import {checkFunctionExpression} from "./visitor/check-function-expression";
import {checkVariableDeclaration} from "./visitor/check-variable-declaration";
import {checkExportSpecifier} from "./visitor/check-export-specifier";
import {LocalSymbolMap} from "../../../declaration-pre-bundler/declaration-pre-bundler-options";
import {hasExportModifier} from "../../../declaration-pre-bundler/util/modifier/modifier-util";
import {NodeToReferencedIdentifiersCache} from "../cache/reference-cache";
import {checkArrayBindingPattern} from "./visitor/check-array-binding-pattern";
import {checkObjectBindingPattern} from "./visitor/check-object-binding-pattern";
import {checkBindingElement} from "./visitor/check-binding-element";
import {checkMethodDeclaration} from "./visitor/check-method-declaration";
import {checkMethodSignature} from "./visitor/check-method-signature";
import {checkPropertyDeclaration} from "./visitor/check-property-declaration";
import {checkPropertySignature} from "./visitor/check-property-signature";
import {checkGetAccessorDeclaration} from "./visitor/check-get-accessor-declaration";
import {checkSetAccessorDeclaration} from "./visitor/check-set-accessor-declaration";
import {checkParameterDeclaration} from "./visitor/check-parameter-declaration";
import {checkVariableDeclarationList} from "./visitor/check-variable-declaration-list";
import {checkVariableStatement} from "./visitor/check-variable-statement";
import {checkExportDeclaration} from "./visitor/check-export-declaration";
import {checkExportAssignment} from "./visitor/check-export-assignment";
import {checkModuleDeclaration} from "./visitor/check-module-declaration";

/**
 * Visits the given node. Returns true if it references the node to check for references, and false otherwise
 * @param {Node} currentNode
 * @return {boolean}
 */
function checkNode ({node, originalNode, ...rest}: ReferenceVisitorOptions): string[] {

	if (isArrayBindingPattern(node)) {
		return checkArrayBindingPattern({node, originalNode, ...rest});
	} else if (isObjectBindingPattern(node)) {
		return checkObjectBindingPattern({node, originalNode, ...rest});
	} else if (isParameter(node)) {
		return checkParameterDeclaration({node, originalNode, ...rest});
	} else if (isBindingElement(node)) {
		return checkBindingElement({node, originalNode, ...rest});
	} else if (isMethodDeclaration(node)) {
		return checkMethodDeclaration({node, originalNode, ...rest});
	} else if (isMethodSignature(node)) {
		return checkMethodSignature({node, originalNode, ...rest});
	} else if (isGetAccessorDeclaration(node)) {
		return checkGetAccessorDeclaration({node, originalNode, ...rest});
	} else if (isSetAccessorDeclaration(node)) {
		return checkSetAccessorDeclaration({node, originalNode, ...rest});
	} else if (isPropertyDeclaration(node)) {
		return checkPropertyDeclaration({node, originalNode, ...rest});
	} else if (isPropertySignature(node)) {
		return checkPropertySignature({node, originalNode, ...rest});
	} else if (isClassDeclaration(node)) {
		return checkClassDeclaration({node, originalNode, ...rest});
	} else if (isClassExpression(node)) {
		return checkClassExpression({node, originalNode, ...rest});
	} else if (isFunctionDeclaration(node)) {
		return checkFunctionDeclaration({node, originalNode, ...rest});
	} else if (isFunctionExpression(node)) {
		return checkFunctionExpression({node, originalNode, ...rest});
	} else if (isInterfaceDeclaration(node)) {
		return checkInterfaceDeclaration({node, originalNode, ...rest});
	} else if (isEnumDeclaration(node)) {
		return checkEnumDeclaration({node, originalNode, ...rest});
	} else if (isTypeAliasDeclaration(node)) {
		return checkTypeAliasDeclaration({node, originalNode, ...rest});
	} else if (isVariableStatement(node)) {
		return checkVariableStatement({node, originalNode, ...rest});
	} else if (isVariableDeclarationList(node)) {
		return checkVariableDeclarationList({node, originalNode, ...rest});
	} else if (isVariableDeclaration(node)) {
		return checkVariableDeclaration({node, originalNode, ...rest});
	} else if (isExportDeclaration(node)) {
		return checkExportDeclaration({node, originalNode, ...rest});
	} else if (isExportAssignment(node)) {
		return checkExportAssignment({node, originalNode, ...rest});
	} else if (isExportSpecifier(node)) {
		return checkExportSpecifier({node, originalNode, ...rest});
	} else if (isModuleDeclaration(node)) {
		return checkModuleDeclaration({node, originalNode, ...rest});
	} else if (isIdentifier(node)) {
		return checkIdentifier({node, originalNode, ...rest});
	} else {
		return rest.childContinuation(node);
	}
}

/**
 * Visits the given node. Returns true if it references the node to check for references, and false otherwise
 * @return {Node?}
 */
function getReferencingNodes (originalNode: Node, identifiers: LocalSymbolMap, cache: NodeToReferencedIdentifiersCache): Node[] {
	const referencingNodes = new Set<Node>();

	for (const identifier of identifiers.keys()) {
		const nodesReferencingIdentifier = cache.get(identifier);
		if (nodesReferencingIdentifier != null) {
			for (const node of nodesReferencingIdentifier) {
				if (node === originalNode || nodeContainsChild(originalNode, node)) continue;
				referencingNodes.add(node);
			}
		}
	}

	return [...referencingNodes];
}

export function isTopLevelNode (node: Node): boolean {
	return node.parent != null && (
		isSourceFile(node.parent)
	);
}

/**
 * Returns true if the given Node is referenced within the given options
 * @param {IsReferencedOptions} opts
 * @return {Node[]}
 */
export function isReferenced<T extends Node> ({seenNodes = new Set(), ...options}: IsReferencedOptions<T>): boolean {
	// Exports are always referenced and should never be removed
	if (
		isExportDeclaration(options.node) ||
		isExportSpecifier(options.node) ||
		isExportAssignment(options.node) ||
		hasExportModifier(options.node) ||
		isModuleDeclaration(options.node)
	) {
		return true;
	}

	// If it has been computed previously, use the cached result
	if (options.referenceCache.has(options.node)) {
		return options.referenceCache.get(options.node)!;
	}

	// Assume that the node is referenced if the received node has been visited before in the recursive stack
	if (seenNodes.has(options.node)) {
		return true;
	} else {
		// Otherwise, add the node to the Set of seen nodes
		seenNodes.add(options.node);
	}

	// Collect the identifier for the node
	const identifiers = getIdentifiersForNode(options);

	// If there are no identifiers for the node, include it since it cannot be referenced.
	if (identifiers.size === 0) {
		return true;
	}

	// Collect all nodes that references the given node
	const referencingNodes = collectReferences(options, identifiers);

	// Compute the result
	const result =
		referencingNodes.length > 0 && referencingNodes.some(referencingNode => isReferenced({...options, seenNodes, node: referencingNode}));

	// Cache the result
	options.referenceCache.set(options.node, result);
	return result;
}

function collectReferences<T extends Node> (options: IsReferencedOptions<T>, identifiers: LocalSymbolMap): Node[] {
	let nodeToReferencedIdentifiersCache = options.sourceFileToNodeToReferencedIdentifiersCache.get(options.sourceFile.fileName);

	// If it has been computed for the SourceFile previously, use it.
	if (nodeToReferencedIdentifiersCache == null) {
		// Otherwise, compute it
		nodeToReferencedIdentifiersCache = new Map();
		options.sourceFileToNodeToReferencedIdentifiersCache.set(options.sourceFile.fileName, nodeToReferencedIdentifiersCache);

		const visitorOptions = {
			...options,
			originalNode: options.node,
			markIdentifiersAsReferenced (fromNode: Node, ...referencedIdentifiers: string[]) {
				for (const identifier of referencedIdentifiers) {
					let matchingSet = nodeToReferencedIdentifiersCache!.get(identifier);
					if (matchingSet == null) {
						matchingSet = new Set();
						nodeToReferencedIdentifiersCache!.set(identifier, matchingSet);
					}
					matchingSet.add(fromNode);
				}
			},
			childContinuation: (node: Node): string[] => {
				const referencedIdentifiers: string[] = [];
				forEachChild<void>(node, nextNode => {
					referencedIdentifiers.push(...checkNode({...visitorOptions, node: nextNode}));
				});
				return referencedIdentifiers;
			},
			continuation: (node: Node): string[] => checkNode({...visitorOptions, node})
		};

		forEachChild<void>(options.sourceFile, node => {
			checkNode({...visitorOptions, node});
		});
	}

	return getReferencingNodes(
		options.node,
		identifiers,
		nodeToReferencedIdentifiersCache
	);
}
