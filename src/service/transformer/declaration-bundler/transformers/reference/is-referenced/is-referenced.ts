import {IsReferencedOptions} from "./is-referenced-options";
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
import {checkIndexedAccessTypeNode} from "./visitor/check-indexed-access-type-node";
import {checkPropertyAccessExpression} from "./visitor/check-property-access-expression";
import {checkQualifiedName} from "./visitor/check-qualified-name";
import {TS} from "../../../../../../type/ts";
import {nodeContainsChild} from "../../../util/node-contains-child";
import {hasExportModifier} from "../../../util/modifier-util";
import {traceIdentifiers} from "../../trace-identifiers/trace-identifiers";

/**
 * Visits the given node. Returns true if it references the node to check for references, and false otherwise
 */
function checkNode({node, originalNode, ...options}: ReferenceVisitorOptions): string[] {
	if (options.typescript.isArrayBindingPattern(node)) {
		return checkArrayBindingPattern({node, originalNode, ...options});
	} else if (options.typescript.isObjectBindingPattern(node)) {
		return checkObjectBindingPattern({node, originalNode, ...options});
	} else if (options.typescript.isParameter(node)) {
		return checkParameterDeclaration({node, originalNode, ...options});
	} else if (options.typescript.isQualifiedName(node)) {
		return checkQualifiedName({node, originalNode, ...options});
	} else if (options.typescript.isBindingElement(node)) {
		return checkBindingElement({node, originalNode, ...options});
	} else if (options.typescript.isMethodDeclaration(node)) {
		return checkMethodDeclaration({node, originalNode, ...options});
	} else if (options.typescript.isMethodSignature(node)) {
		return checkMethodSignature({node, originalNode, ...options});
	} else if (options.typescript.isGetAccessorDeclaration(node)) {
		return checkGetAccessorDeclaration({node, originalNode, ...options});
	} else if (options.typescript.isSetAccessorDeclaration(node)) {
		return checkSetAccessorDeclaration({node, originalNode, ...options});
	} else if (options.typescript.isPropertyAccessExpression(node)) {
		return checkPropertyAccessExpression({node, originalNode, ...options});
	} else if (options.typescript.isPropertyDeclaration(node)) {
		return checkPropertyDeclaration({node, originalNode, ...options});
	} else if (options.typescript.isPropertySignature(node)) {
		return checkPropertySignature({node, originalNode, ...options});
	} else if (options.typescript.isClassDeclaration(node)) {
		return checkClassDeclaration({node, originalNode, ...options});
	} else if (options.typescript.isClassExpression(node)) {
		return checkClassExpression({node, originalNode, ...options});
	} else if (options.typescript.isFunctionDeclaration(node)) {
		return checkFunctionDeclaration({node, originalNode, ...options});
	} else if (options.typescript.isFunctionExpression(node)) {
		return checkFunctionExpression({node, originalNode, ...options});
	} else if (options.typescript.isInterfaceDeclaration(node)) {
		return checkInterfaceDeclaration({node, originalNode, ...options});
	} else if (options.typescript.isEnumDeclaration(node)) {
		return checkEnumDeclaration({node, originalNode, ...options});
	} else if (options.typescript.isTypeAliasDeclaration(node)) {
		return checkTypeAliasDeclaration({node, originalNode, ...options});
	} else if (options.typescript.isIndexedAccessTypeNode(node)) {
		return checkIndexedAccessTypeNode({node, originalNode, ...options});
	} else if (options.typescript.isVariableStatement(node)) {
		return checkVariableStatement({node, originalNode, ...options});
	} else if (options.typescript.isVariableDeclarationList(node)) {
		return checkVariableDeclarationList({node, originalNode, ...options});
	} else if (options.typescript.isVariableDeclaration(node)) {
		return checkVariableDeclaration({node, originalNode, ...options});
	} else if (options.typescript.isExportDeclaration(node)) {
		return checkExportDeclaration({node, originalNode, ...options});
	} else if (options.typescript.isExportAssignment(node)) {
		return checkExportAssignment({node, originalNode, ...options});
	} else if (options.typescript.isExportSpecifier(node)) {
		return checkExportSpecifier({node, originalNode, ...options});
	} else if (options.typescript.isModuleDeclaration(node)) {
		return checkModuleDeclaration({node, originalNode, ...options});
	} else if (options.typescript.isIdentifier(node)) {
		return checkIdentifier({node, originalNode, ...options});
	} else {
		return options.childContinuation(node);
	}
}

/**
 * Visits the given node. Returns true if it references the node to check for references, and false otherwise
 */
function getReferencingNodes(originalNode: TS.Node, identifiers: Set<string>, cache: NodeToReferencedIdentifiersCache): TS.Node[] {
	const referencingNodes = new Set<TS.Node>();

	for (const identifier of identifiers) {
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

/**
 * Returns true if the given Node is referenced within the given options
 */
export function isReferenced<T extends TS.Node>({seenNodes = new Set(), ...options}: IsReferencedOptions<T>): boolean {
	// Exports are always referenced and should never be removed
	if (
		options.typescript.isExportDeclaration(options.node) ||
		options.typescript.isExportSpecifier(options.node) ||
		options.typescript.isExportAssignment(options.node) ||
		hasExportModifier(options.node, options.typescript) ||
		options.typescript.isModuleDeclaration(options.node)
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
	const identifiers = traceIdentifiers(options);

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

function collectReferences<T extends TS.Node>(options: IsReferencedOptions<T>, identifiers: Set<string>): TS.Node[] {
	let nodeToReferencedIdentifiersCache = options.sourceFileToNodeToReferencedIdentifiersCache.get(options.sourceFile.fileName);

	// If it has been computed for the SourceFile previously, use it.
	if (nodeToReferencedIdentifiersCache == null) {
		// Otherwise, compute it
		nodeToReferencedIdentifiersCache = new Map();
		options.sourceFileToNodeToReferencedIdentifiersCache.set(options.sourceFile.fileName, nodeToReferencedIdentifiersCache);

		const visitorOptions = {
			...options,
			originalNode: options.node,
			markIdentifiersAsReferenced(fromNode: TS.Node, ...referencedIdentifiers: string[]) {
				for (const identifier of referencedIdentifiers) {
					let matchingSet = nodeToReferencedIdentifiersCache!.get(identifier);
					if (matchingSet == null) {
						matchingSet = new Set();
						nodeToReferencedIdentifiersCache!.set(identifier, matchingSet);
					}
					matchingSet.add(fromNode);
				}
			},
			childContinuation: (node: TS.Node): string[] => {
				const referencedIdentifiers: string[] = [];
				options.typescript.forEachChild<void>(node, nextNode => {
					referencedIdentifiers.push(...checkNode({...visitorOptions, node: nextNode}));
				});
				return referencedIdentifiers;
			},
			continuation: (node: TS.Node): string[] => checkNode({...visitorOptions, node})
		};

		options.typescript.forEachChild<void>(options.sourceFile, node => {
			checkNode({...visitorOptions, node});
		});
	}

	return getReferencingNodes(options.node, identifiers, nodeToReferencedIdentifiersCache);
}
