import {IsReferencedOptions} from "./is-referenced-options.js";
import {ReferenceVisitorOptions} from "./reference-visitor-options.js";
import {checkClassDeclaration} from "./visitor/check-class-declaration.js";
import {checkIdentifier} from "./visitor/check-identifier.js";
import {checkClassExpression} from "./visitor/check-class-expression.js";
import {checkInterfaceDeclaration} from "./visitor/check-interface-declaration.js";
import {checkEnumDeclaration} from "./visitor/check-enum-declaration.js";
import {checkTypeAliasDeclaration} from "./visitor/check-type-alias-declaration.js";
import {checkFunctionDeclaration} from "./visitor/check-function-declaration.js";
import {checkFunctionExpression} from "./visitor/check-function-expression.js";
import {checkVariableDeclaration} from "./visitor/check-variable-declaration.js";
import {checkExportSpecifier} from "./visitor/check-export-specifier.js";
import {NodeToReferencedIdentifiersCache} from "../cache/reference-cache.js";
import {checkArrayBindingPattern} from "./visitor/check-array-binding-pattern.js";
import {checkObjectBindingPattern} from "./visitor/check-object-binding-pattern.js";
import {checkBindingElement} from "./visitor/check-binding-element.js";
import {checkMethodDeclaration} from "./visitor/check-method-declaration.js";
import {checkMethodSignature} from "./visitor/check-method-signature.js";
import {checkPropertyDeclaration} from "./visitor/check-property-declaration.js";
import {checkPropertySignature} from "./visitor/check-property-signature.js";
import {checkGetAccessorDeclaration} from "./visitor/check-get-accessor-declaration.js";
import {checkSetAccessorDeclaration} from "./visitor/check-set-accessor-declaration.js";
import {checkParameterDeclaration} from "./visitor/check-parameter-declaration.js";
import {checkVariableDeclarationList} from "./visitor/check-variable-declaration-list.js";
import {checkVariableStatement} from "./visitor/check-variable-statement.js";
import {checkExportDeclaration} from "./visitor/check-export-declaration.js";
import {checkExportAssignment} from "./visitor/check-export-assignment.js";
import {checkModuleDeclaration} from "./visitor/check-module-declaration.js";
import {checkIndexedAccessTypeNode} from "./visitor/check-indexed-access-type-node.js";
import {checkPropertyAccessExpression} from "./visitor/check-property-access-expression.js";
import {checkQualifiedName} from "./visitor/check-qualified-name.js";
import {TS} from "../../../../../../type/ts.js";
import {nodeContainsChild} from "../../../util/node-contains-child.js";
import {hasExportModifier} from "../../../util/modifier-util.js";
import {traceIdentifiers} from "../../trace-identifiers/trace-identifiers.js";
import {checkTemplateLiteralTypeNode} from "./visitor/check-template-literal-type-node.js";
import {isTemplateLiteralTypeNode} from "../../../../../../util/predicates/predicates.js";
import {checkTemplateLiteralTypeSpan} from "./visitor/check-template-literal-type-span.js";
import {checkTypeReferenceNode} from "./visitor/check-type-reference-node.js";
import {isNodeInternalAlias} from "../../../util/node-util.js";
import {getParentNode} from "../../../util/get-parent-node.js";
import {checkImportEqualsDeclaration} from "./visitor/check-import-equals-declaration.js";

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
	} else if (options.typescript.isImportEqualsDeclaration(node)) {
		return checkImportEqualsDeclaration({node, originalNode, ...options});
	} else if (options.typescript.isExportAssignment(node)) {
		return checkExportAssignment({node, originalNode, ...options});
	} else if (options.typescript.isExportSpecifier(node)) {
		return checkExportSpecifier({node, originalNode, ...options});
	} else if (options.typescript.isModuleDeclaration(node)) {
		return checkModuleDeclaration({node, originalNode, ...options});
	} else if (options.typescript.isIdentifier(node)) {
		return checkIdentifier({node, originalNode, ...options});
	} else if (isTemplateLiteralTypeNode(node, options.typescript)) {
		return checkTemplateLiteralTypeNode({node, originalNode, ...options});
	} else if (options.typescript.isTemplateLiteralTypeSpan?.(node)) {
		return checkTemplateLiteralTypeSpan({node, originalNode, ...options});
	} else if (options.typescript.isTypeReferenceNode(node)) {
		return checkTypeReferenceNode({node, originalNode, ...options});
	} else {
		return options.childContinuation(node);
	}
}

/**
 * Visits the given node. Returns true if it references the node to check for references, and false otherwise
 */
function getReferencingNodes(originalNode: TS.Node, identifiers: Set<string>, cache: NodeToReferencedIdentifiersCache): TS.Node[] {
	// TODO: Can all of this be replaced by typescript.FindAllReferences.Core.isSymbolReferencedInFile(identifier, typeChecker, sourceFile); ?
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
	// Exports are always referenced and should never be removed, unless located within module declarations that themselves will be removed
	if (
		options.typescript.isExportDeclaration(options.node) ||
		options.typescript.isExportSpecifier(options.node) ||
		options.typescript.isExportAssignment(options.node) ||
		hasExportModifier(options.node, options.typescript) ||
		(options.typescript.isModuleDeclaration(options.node) && !isNodeInternalAlias(options.node, options.typescript))
	) {
		const parentNode = getParentNode(options.node);
		if (parentNode == null || !options.typescript.isModuleBlock(parentNode)) {
			return true;
		} else {
			return isReferenced({...options, seenNodes, node: getParentNode(parentNode)});
		}
	}

	// If it has been computed previously, use the cached result
	if (options.referenceCache.has(options.node)) {
		return options.referenceCache.get(options.node)!;
	}

	// Assume that the node is referenced if we've seen it before
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
		referencingNodes.length > 0 && referencingNodes.some(referencingNode => isReferenced({...options, seenNodes, node: referencingNode, referencedNode: options.node}));

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
