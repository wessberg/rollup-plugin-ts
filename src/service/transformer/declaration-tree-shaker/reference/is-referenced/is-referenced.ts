import {
	forEachChild,
	isArrayBindingPattern,
	isArrayTypeNode,
	isBindingElement,
	isCallSignatureDeclaration,
	isClassDeclaration,
	isConditionalTypeNode,
	isConstructorDeclaration,
	isEnumDeclaration,
	isEnumMember,
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
	isPropertyAccessExpression,
	isPropertyDeclaration,
	isPropertySignature,
	isQualifiedName,
	isToken,
	isTupleTypeNode,
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
	OptionalTypeNode,
	SyntaxKind
} from "typescript";
import {IsReferencedOptions} from "./is-referenced-options";
import {nodeContainsChild} from "../../util/node-contains-child";
import {getIdentifiersForNode} from "../../util/get-identifiers-for-node";
import {isKeywordTypeNode} from "../../util/is-keyword-type-node";
import {hasExportModifier} from "../../../declaration-bundler/util/modifier/modifier-util";
import {ReferenceVisitorOptions} from "./reference-visitor-options";
import {checkExportDeclaration} from "./visitor/reference-visitor/check-export-declaration";
import {checkMethodDeclaration} from "./visitor/reference-visitor/check-method-declaration";
import {checkFunctionTypeNode} from "./visitor/reference-visitor/check-function-type-node";
import {checkBindingElement} from "./visitor/reference-visitor/check-binding-element";
import {checkParenthesizedTypeNode} from "./visitor/reference-visitor/check-parenthesized-type-node";
import {checkExportSpecifier} from "./visitor/reference-visitor/check-export-specifier";
import {checkVariableDeclaration} from "./visitor/reference-visitor/check-variable-declaration";
import {checkInterfaceDeclaration} from "./visitor/reference-visitor/check-interface-declaration";
import {checkOptionalTypeNode} from "./visitor/reference-visitor/check-optional-type-node";
import {checkTypeAliasDeclaration} from "./visitor/reference-visitor/check-type-alias-declaration";
import {checkExportAssignment} from "./visitor/reference-visitor/check-export-assignment";
import {checkKeywordTypeNode} from "./visitor/reference-visitor/check-keyword-type-node";
import {checkTypeLiteralNode} from "./visitor/reference-visitor/check-type-literal-node";
import {checkParameterDeclaration} from "./visitor/reference-visitor/check-parameter-declaration";
import {checkUnionTypeNode} from "./visitor/reference-visitor/check-union-type-node";
import {checkExpressionWithTypeArguments} from "./visitor/reference-visitor/check-expression-with-type-arguments";
import {checkTypeParameterDeclaration} from "./visitor/reference-visitor/check-type-parameter-declaration";
import {checkConstructorDeclaration} from "./visitor/reference-visitor/check-constructor-declaration";
import {checkPropertyDeclaration} from "./visitor/reference-visitor/check-property-declaration";
import {checkTypePredicateNode} from "./visitor/reference-visitor/check-type-predicate-node";
import {checkIdentifier} from "./visitor/reference-visitor/check-identifier";
import {checkEnumMember} from "./visitor/reference-visitor/check-enum-member";
import {checkQualifiedName} from "./visitor/reference-visitor/check-qualified-name";
import {checkTupleTypeNode} from "./visitor/reference-visitor/check-tuple-type-node";
import {checkFunctionDeclaration} from "./visitor/reference-visitor/check-function-declaration";
import {checkIndexSignatureDeclaration} from "./visitor/reference-visitor/check-index-signature-declaration";
import {checkArrayTypeNode} from "./visitor/reference-visitor/check-array-type-node";
import {checkPropertySignature} from "./visitor/reference-visitor/check-property-signature";
import {checkBindingPattern} from "./visitor/reference-visitor/check-binding-pattern";
import {checkTypeReferenceNode} from "./visitor/reference-visitor/check-type-reference-node";
import {checkLiteralTypeNode} from "./visitor/reference-visitor/check-literal-type-node";
import {checkIndexedAccessTypeNode} from "./visitor/reference-visitor/check-indexed-access-type-node";
import {checkTypeQueryNode} from "./visitor/reference-visitor/check-type-query-node";
import {checkPropertyAccessExpression} from "./visitor/reference-visitor/check-property-access-expression";
import {checkIntersectionTypeNode} from "./visitor/reference-visitor/check-intersection-type-node";
import {checkEnumDeclaration} from "./visitor/reference-visitor/check-enum-declaration";
import {checkToken} from "./visitor/reference-visitor/check-token";
import {checkClassDeclaration} from "./visitor/reference-visitor/check-class-declaration";
import {checkImportDeclaration} from "./visitor/reference-visitor/check-import-declaration";
import {checkVariableStatement} from "./visitor/reference-visitor/check-variable-statement";
import {checkMethodSignature} from "./visitor/reference-visitor/check-method-signature";
import {checkConditionalTypeNode} from "./visitor/reference-visitor/check-conditional-type-node";
import {checkCallSignatureDeclaration} from "./visitor/reference-visitor/check-call-signature-declaration";
import {checkVariableDeclarationList} from "./visitor/reference-visitor/check-variable-declaration-list";
import {isAmbientModuleRootLevelNode} from "../../util/is-ambient-module-root-level-node";

/**
 * Visits the given node. Returns true if it references the node to check for references, and false otherwise
 * @param {Node} currentNode
 * @param {ReferenceVisitorOptions} options
 * @return {boolean}
 */
function checkNode(currentNode: Node, options: ReferenceVisitorOptions): boolean {
	if (options.node === currentNode || nodeContainsChild(options.node, currentNode)) return false;
	if (isExportDeclaration(currentNode)) return checkExportDeclaration(currentNode, options);
	else if (isExportAssignment(currentNode)) return checkExportAssignment(currentNode, options);
	else if (isImportDeclaration(currentNode)) return checkImportDeclaration(currentNode, options);
	else if (isExportSpecifier(currentNode)) return checkExportSpecifier(currentNode, options);
	else if (isParameter(currentNode)) return checkParameterDeclaration(currentNode, options);
	else if (isIdentifier(currentNode)) return checkIdentifier(currentNode, options);
	else if (isTypeReferenceNode(currentNode)) return checkTypeReferenceNode(currentNode, options);
	else if (isUnionTypeNode(currentNode)) return checkUnionTypeNode(currentNode, options);
	else if (isIntersectionTypeNode(currentNode)) return checkIntersectionTypeNode(currentNode, options);
	else if (isInterfaceDeclaration(currentNode)) return checkInterfaceDeclaration(currentNode, options);
	else if (isEnumDeclaration(currentNode)) return checkEnumDeclaration(currentNode, options);
	else if (isEnumMember(currentNode)) return checkEnumMember(currentNode, options);
	else if (isConditionalTypeNode(currentNode)) return checkConditionalTypeNode(currentNode, options);
	else if (isTupleTypeNode(currentNode)) return checkTupleTypeNode(currentNode, options);
	else if (isPropertyAccessExpression(currentNode)) return checkPropertyAccessExpression(currentNode, options);
	else if (isClassDeclaration(currentNode)) return checkClassDeclaration(currentNode, options);
	else if (isLiteralTypeNode(currentNode)) return checkLiteralTypeNode(currentNode, options);
	else if (isParenthesizedTypeNode(currentNode)) return checkParenthesizedTypeNode(currentNode, options);
	else if (isTypeParameterDeclaration(currentNode)) return checkTypeParameterDeclaration(currentNode, options);
	else if (isTypeAliasDeclaration(currentNode)) return checkTypeAliasDeclaration(currentNode, options);
	else if (isFunctionDeclaration(currentNode)) return checkFunctionDeclaration(currentNode, options);
	else if (isConstructorDeclaration(currentNode)) return checkConstructorDeclaration(currentNode, options);
	else if (isVariableStatement(currentNode)) return checkVariableStatement(currentNode, options);
	else if (isVariableDeclarationList(currentNode)) return checkVariableDeclarationList(currentNode, options);
	else if (isVariableDeclaration(currentNode)) return checkVariableDeclaration(currentNode, options);
	else if (isIndexedAccessTypeNode(currentNode)) return checkIndexedAccessTypeNode(currentNode, options);
	else if (isPropertySignature(currentNode)) return checkPropertySignature(currentNode, options);
	else if (isPropertyDeclaration(currentNode)) return checkPropertyDeclaration(currentNode, options);
	else if (isMethodDeclaration(currentNode)) return checkMethodDeclaration(currentNode, options);
	else if (isCallSignatureDeclaration(currentNode)) return checkCallSignatureDeclaration(currentNode, options);
	else if (isFunctionTypeNode(currentNode)) return checkFunctionTypeNode(currentNode, options);
	else if (isMethodSignature(currentNode)) return checkMethodSignature(currentNode, options);
	else if (isIndexSignatureDeclaration(currentNode)) return checkIndexSignatureDeclaration(currentNode, options);
	else if (isExpressionWithTypeArguments(currentNode)) return checkExpressionWithTypeArguments(currentNode, options);
	else if (isTypeQueryNode(currentNode)) return checkTypeQueryNode(currentNode, options);
	else if (isTypeLiteralNode(currentNode)) return checkTypeLiteralNode(currentNode, options);
	else if (isArrayTypeNode(currentNode)) return checkArrayTypeNode(currentNode, options);
	else if (isTypePredicateNode(currentNode)) return checkTypePredicateNode(currentNode, options);
	else if (isKeywordTypeNode(currentNode)) return checkKeywordTypeNode(currentNode, options);
	else if (isBindingElement(currentNode)) return checkBindingElement(currentNode, options);
	else if (isObjectBindingPattern(currentNode) || isArrayBindingPattern(currentNode)) return checkBindingPattern(currentNode, options);
	else if (isToken(currentNode)) return checkToken(currentNode, options);
	else if (isQualifiedName(currentNode)) return checkQualifiedName(currentNode, options);
	else if (currentNode.kind === SyntaxKind.OptionalType) return checkOptionalTypeNode(currentNode as OptionalTypeNode, options);

	throw new TypeError(`Could not handle Node of kind: ${SyntaxKind[currentNode.kind]}`);
}

/**
 * Visits the given node. Returns true if it references the node to check for references, and false otherwise
 * @param {Node} currentNode
 * @param {VisitorOptions} options
 * @return {Node?}
 */
function visitNode(currentNode: Node, options: ReferenceVisitorOptions): void {
	if (options.node === currentNode || nodeContainsChild(options.node, currentNode)) return;

	if (isAmbientModuleRootLevelNode(currentNode) && options.continuation(currentNode)) {
		options.referencingNodes.add(currentNode);
	}
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
	const visitorOptions = {
		...options,
		referencingNodes: new Set(),
		identifiers: getIdentifiersForNode(options.node, options.cache),
		continuation: (node: Node): boolean => checkNode(node, visitorOptions)
	};

	const sourceFile = options.node.getSourceFile();
	forEachChild<void>(sourceFile, node => visitNode(node, visitorOptions));
	console.log(SyntaxKind[visitorOptions.node.kind], [...visitorOptions.referencingNodes].map(n => (isInterfaceDeclaration(n) ? n.name.text : SyntaxKind[n.kind])));
	return [...visitorOptions.referencingNodes];
}
