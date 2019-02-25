import {
	forEachChild,
	isArrayBindingPattern,
	isArrayTypeNode,
	isBindingElement,
	isClassDeclaration,
	isConstructorDeclaration,
	isExportAssignment,
	isExportDeclaration,
	isExportSpecifier,
	isExpressionWithTypeArguments,
	isFunctionDeclaration,
	isFunctionTypeNode,
	isIdentifier,
	isImportDeclaration,
	isIndexedAccessTypeNode,
	isIndexSignatureDeclaration,
	isInterfaceDeclaration,
	isIntersectionTypeNode,
	isLiteralTypeNode,
	isMethodDeclaration,
	isMethodSignature,
	isObjectBindingPattern,
	isParameter,
	isParenthesizedTypeNode,
	isPropertyDeclaration,
	isPropertySignature,
	isToken,
	isTypeAliasDeclaration,
	isTypeLiteralNode,
	isTypeParameterDeclaration,
	isTypePredicateNode,
	isTypeQueryNode,
	isTypeReferenceNode,
	isUnionTypeNode,
	isVariableDeclaration,
	isVariableDeclarationList,
	isVariableStatement,
	Node,
	SyntaxKind
} from "typescript";
import {IsReferencedOptions} from "./is-referenced-options";
import {nodeContainsChild} from "../../util/node-contains-child";
import {VisitorOptions} from "./visitor-options";
import {visitExportDeclaration} from "./visitor/visit-export-declaration";
import {visitInterfaceDeclaration} from "./visitor/visit-interface-declaration";
import {visitIdentifier} from "./visitor/visit-identifier";
import {visitTypeReferenceNode} from "./visitor/visit-type-reference-node";
import {visitKeywordTypeNode} from "./visitor/visit-keyword-type-node";
import {visitToken} from "./visitor/visit-token";
import {visitImportDeclaration} from "./visitor/visit-import-declaration";
import {visitParameterDeclaration} from "./visitor/visit-parameter-declaration";
import {visitUnionTypeNode} from "./visitor/visit-union-type-node";
import {visitIntersectionTypeNode} from "./visitor/visit-intersection-type-node";
import {visitTypeLiteralNode} from "./visitor/visit-type-literal-node";
import {visitArrayTypeNode} from "./visitor/visit-array-type-node";
import {visitTypeParameterDeclaration} from "./visitor/visit-type-parameter-declaration";
import {visitFunctionDeclaration} from "./visitor/visit-function-declaration";
import {visitVariableStatement} from "./visitor/visit-variable-statement";
import {visitVariableDeclarationList} from "./visitor/visit-variable-declaration-list";
import {visitVariableDeclaration} from "./visitor/visit-variable-declaration";
import {visitIndexedAccessTypeNode} from "./visitor/visit-indexed-access-type-node";
import {visitPropertySignature} from "./visitor/visit-property-signature";
import {visitClassDeclaration} from "./visitor/visit-class-declaration";
import {visitTypeAliasDeclaration} from "./visitor/visit-type-alias-declaration";
import {visitLiteralTypeNode} from "./visitor/visit-literal-type-node";
import {visitParenthesizedTypeNode} from "./visitor/visit-parenthesized-type-node";
import {visitBindingPattern} from "./visitor/visit-binding-pattern";
import {visitBindingElement} from "./visitor/visit-binding-element";
import {visitMethodSignature} from "./visitor/visit-method-signature";
import {visitIndexSignatureDeclaration} from "./visitor/visit-index-signature-declaration";
import {visitExpressionWithTypeArguments} from "./visitor/visit-expression-with-type-arguments";
import {visitTypeQueryNode} from "./visitor/visit-type-query-node";
import {visitPropertyDeclaration} from "./visitor/visit-property-declaration";
import {visitConstructorDeclaration} from "./visitor/visit-constructor-declaration";
import {visitMethodDeclaration} from "./visitor/visit-method-declaration";
import {visitFunctionTypeNode} from "./visitor/visit-function-type-node";
import {visitTypePredicateNode} from "./visitor/visit-type-predicate-node";
import {visitExportSpecifier} from "./visitor/visit-export-specifier";
import {getIdentifiersForNode} from "../../util/get-identifiers-for-node";
import {isKeywordTypeNode} from "../../util/is-keyword-type-node";
import {visitExportAssignment} from "./visitor/visit-export-assignment";
import {hasExportModifier} from "../../../declaration-transformers/util/modifier/modifier-util";

/**
 * Visits the given node. Returns true if it references the node to check for references, and false otherwise
 * @param {Node} currentNode
 * @param {VisitorOptions} options
 * @return {Node?}
 */
function visitNode(currentNode: Node, options: VisitorOptions): void {
	if (options.node === currentNode || nodeContainsChild(options.node, currentNode)) return;

	if (isExportDeclaration(currentNode)) return visitExportDeclaration(currentNode, options);
	else if (isExportAssignment(currentNode)) return visitExportAssignment(currentNode, options);
	else if (isImportDeclaration(currentNode)) return visitImportDeclaration(currentNode, options);
	else if (isExportSpecifier(currentNode)) return visitExportSpecifier(currentNode, options);
	else if (isParameter(currentNode)) return visitParameterDeclaration(currentNode, options);
	else if (isIdentifier(currentNode)) return visitIdentifier(currentNode, options);
	else if (isTypeReferenceNode(currentNode)) return visitTypeReferenceNode(currentNode, options);
	else if (isUnionTypeNode(currentNode)) return visitUnionTypeNode(currentNode, options);
	else if (isIntersectionTypeNode(currentNode)) return visitIntersectionTypeNode(currentNode, options);
	else if (isInterfaceDeclaration(currentNode)) return visitInterfaceDeclaration(currentNode, options);
	else if (isClassDeclaration(currentNode)) return visitClassDeclaration(currentNode, options);
	else if (isLiteralTypeNode(currentNode)) return visitLiteralTypeNode(currentNode, options);
	else if (isParenthesizedTypeNode(currentNode)) return visitParenthesizedTypeNode(currentNode, options);
	else if (isTypeParameterDeclaration(currentNode)) return visitTypeParameterDeclaration(currentNode, options);
	else if (isTypeAliasDeclaration(currentNode)) return visitTypeAliasDeclaration(currentNode, options);
	else if (isFunctionDeclaration(currentNode)) return visitFunctionDeclaration(currentNode, options);
	else if (isConstructorDeclaration(currentNode)) return visitConstructorDeclaration(currentNode, options);
	else if (isVariableStatement(currentNode)) return visitVariableStatement(currentNode, options);
	else if (isVariableDeclarationList(currentNode)) return visitVariableDeclarationList(currentNode, options);
	else if (isVariableDeclaration(currentNode)) return visitVariableDeclaration(currentNode, options);
	else if (isIndexedAccessTypeNode(currentNode)) return visitIndexedAccessTypeNode(currentNode, options);
	else if (isPropertySignature(currentNode)) return visitPropertySignature(currentNode, options);
	else if (isPropertyDeclaration(currentNode)) return visitPropertyDeclaration(currentNode, options);
	else if (isMethodDeclaration(currentNode)) return visitMethodDeclaration(currentNode, options);
	else if (isFunctionTypeNode(currentNode)) return visitFunctionTypeNode(currentNode, options);
	else if (isMethodSignature(currentNode)) return visitMethodSignature(currentNode, options);
	else if (isIndexSignatureDeclaration(currentNode)) return visitIndexSignatureDeclaration(currentNode, options);
	else if (isExpressionWithTypeArguments(currentNode)) return visitExpressionWithTypeArguments(currentNode, options);
	else if (isTypeQueryNode(currentNode)) return visitTypeQueryNode(currentNode, options);
	else if (isTypeLiteralNode(currentNode)) return visitTypeLiteralNode(currentNode, options);
	else if (isArrayTypeNode(currentNode)) return visitArrayTypeNode(currentNode, options);
	else if (isTypePredicateNode(currentNode)) return visitTypePredicateNode(currentNode, options);
	else if (isKeywordTypeNode(currentNode)) return visitKeywordTypeNode(currentNode, options);
	else if (isBindingElement(currentNode)) return visitBindingElement(currentNode, options);
	else if (isObjectBindingPattern(currentNode) || isArrayBindingPattern(currentNode)) return visitBindingPattern(currentNode, options);
	else if (isToken(currentNode)) return visitToken(currentNode, options);

	throw new TypeError(`Could not handle Node of kind: ${SyntaxKind[currentNode.kind]}`);
}

/**
 * Returns true if the given Node is referenced within the given options
 * @param {IsReferencedOptions} opts
 * @return {Node[]}
 */
export function isReferenced<T extends Node>({seenNodes = new Set(), ...options}: IsReferencedOptions<T>): boolean {
	// Exports are always referenced and should never be removed
	if (isExportDeclaration(options.node) || isExportSpecifier(options.node) || isExportAssignment(options.node) || hasExportModifier(options.node)) return true;

	// If it has been computed previously, use the cached result
	if (options.cache.hasReferencesCache.has(options.node)) {
		return options.cache.hasReferencesCache.get(options.node)!;
	}

	// Assume that the node is referenced if the received node has been visited before in the recursive stack
	if (seenNodes.has(options.node)) {
		return true;
	} else {
		// Otherwise, add the node to the Set of seen nodes
		seenNodes.add(options.node);
	}

	// Collect all nods that references the given node
	const referencingNodes = collectReferences(options);

	// Compute the result
	const result = referencingNodes.length > 0 && referencingNodes.some(referencingNode => isReferenced({...options, seenNodes, node: referencingNode}));

	// Cache the result
	options.cache.hasReferencesCache.set(options.node, result);
	return result;
}

function collectReferences<T extends Node>(options: IsReferencedOptions<T>): Node[] {
	// Prepare some VisitorOptions
	let lastContext: Node | undefined;

	const visitorOptions = {
		...options,
		referencingNodes: new Set(),
		identifiers: getIdentifiersForNode(options.node, options.cache),
		continuation: (node: Node, context?: Node) => {
			if (context != null) {
				lastContext = context;
			}

			return visitNode(node, {...visitorOptions, context: lastContext});
		}
	};

	const sourceFile = options.node.getSourceFile();
	forEachChild<void>(sourceFile, node => visitorOptions.continuation(node, node));
	return [...visitorOptions.referencingNodes];
}
