import {
	forEachChild, Identifier, isArrayTypeNode, isArrowFunction, isClassDeclaration, isClassExpression, isComputedPropertyName, isConditionalTypeNode, isConstructorDeclaration, isEnumDeclaration, isEnumMember, isExportDeclaration, isExportSpecifier, isExpressionWithTypeArguments, isFunctionDeclaration, isFunctionExpression, isFunctionTypeNode, isGetAccessorDeclaration, isHeritageClause, isIdentifier, isImportDeclaration, isImportTypeNode, isIndexedAccessTypeNode, isIndexSignatureDeclaration, isInterfaceDeclaration, isIntersectionTypeNode, isLiteralTypeNode, isMappedTypeNode, isMethodDeclaration, isMethodSignature, isParameter, isParenthesizedTypeNode, isPropertyDeclaration, isPropertySignature, isQualifiedName, isSetAccessorDeclaration, isToken, isTupleTypeNode, isTypeAliasDeclaration, isTypeLiteralNode, isTypeOperatorNode, isTypeParameterDeclaration, isTypePredicateNode, isTypeQueryNode, isTypeReferenceNode, isUnionTypeNode, isVariableDeclaration, isVariableStatement, Node, OptionalTypeNode, SourceFile, SyntaxKind
} from "typescript";
import {getIdentifiersForNode, hasDefaultExportModifiers, isKeywordTypeNode, nodeContainsChild} from "../util/util";
import {IReferenceCache} from "../cache/i-reference-cache";
import {DEBUG} from "../../../../constant/constant";

// tslint:disable:no-duplicated-branches

// tslint:disable:no-redundant-parentheses

/**
 * Returns true if the given Node is referenced somewhere in the given SourceFile
 * @param {Node} node
 * @param {Set<string>} usedExports
 * @param {SourceFile} sourceFile
 * @param {IReferenceCache} cache
 * @param {Map<string, string[]>} chunkToOriginalFileMap
 * @param {Set<Node>} [seenNodes]
 * @returns {boolean}
 */
export function hasReferences (
	node: Node,
	usedExports: Set<string>,
	sourceFile: SourceFile,
	cache: IReferenceCache,
	chunkToOriginalFileMap: Map<string, string[]>,
	seenNodes: Set<Node> = new Set()
): boolean {
	// If there is more than 1 chunk, expect the node to be referenced
	if (chunkToOriginalFileMap.size > 1) return true;

	if (cache.hasReferencesCache.has(node)) {
		return cache.hasReferencesCache.get(node)!;
	}

	// Assume that the node is referenced if the received node has been visited before in the recursive stack
	if (seenNodes.has(node)) {
		return true;
	}

	// Otherwise, add the node to the Set of seen nodes
	else {
		seenNodes.add(node);
	}

	let returnValue = false;
	const identifiers = getIdentifiersForNode(node, cache);

	if (exportsContainsIdentifiers(identifiers, usedExports) || (usedExports.has("default") && hasDefaultExportModifiers(node.modifiers))) {
		returnValue = true;
	}
	else {
		const referencingNodes = collectReferencingNodes(node, sourceFile, cache, identifiers);
		returnValue = referencingNodes.length > 0 && referencingNodes.some(referencingNode => hasReferences(referencingNode, usedExports, sourceFile, cache, chunkToOriginalFileMap, seenNodes));
	}

	cache.hasReferencesCache.set(node, returnValue);
	return returnValue;
}

/**
 * Returns true if the given Child Node references the given Node
 * @param {Node} child
 * @param {Identifier[]} identifiers
 * @returns {boolean}
 */
function childReferencesAnyIdentifier (child: Node, identifiers: Identifier[]): boolean {
	if (isIdentifier(child)) {
		return identifiers.some(identifier => child.text === identifier.text);
	}
	else if (isTypeReferenceNode(child)) {
		return (
			childReferencesAnyIdentifier(child.typeName, identifiers) || (child.typeArguments != null && child.typeArguments.some(typeArgument => childReferencesAnyIdentifier(typeArgument, identifiers)))
		);
	}
	else if (child.kind === SyntaxKind.OptionalType) {
		return childReferencesAnyIdentifier((child as OptionalTypeNode).type, identifiers);
	}
	else if (isConstructorDeclaration(child)) {
		return (
			(child.type != null && childReferencesAnyIdentifier(child.type, identifiers)) ||
			child.parameters.some(parameter => childReferencesAnyIdentifier(parameter, identifiers)) ||
			(child.typeParameters != null && child.typeParameters.some(typeParameter => childReferencesAnyIdentifier(typeParameter, identifiers)))
		);
	}
	else if (isPropertyDeclaration(child)) {
		return child.type != null && childReferencesAnyIdentifier(child.type, identifiers);
	}
	else if (isIndexedAccessTypeNode(child)) {
		return (child.indexType != null && childReferencesAnyIdentifier(child.indexType, identifiers)) || (child.objectType != null && childReferencesAnyIdentifier(child.objectType, identifiers));
	}
	else if (isTypeParameterDeclaration(child)) {
		return (
			(child.constraint != null && childReferencesAnyIdentifier(child.constraint, identifiers)) ||
			(child.default != null && childReferencesAnyIdentifier(child.default, identifiers)) ||
			(child.expression != null && childReferencesAnyIdentifier(child.expression, identifiers))
		);
	}
	else if (isInterfaceDeclaration(child)) {
		return (
			(child.heritageClauses != null && child.heritageClauses.some(heritageClause => childReferencesAnyIdentifier(heritageClause, identifiers))) ||
			(child.typeParameters != null && child.typeParameters.some(typeParameter => childReferencesAnyIdentifier(typeParameter, identifiers))) ||
			child.members.some(member => childReferencesAnyIdentifier(member, identifiers))
		);
	}
	else if (isClassDeclaration(child)) {
		return (
			(child.heritageClauses != null && child.heritageClauses.some(heritageClause => childReferencesAnyIdentifier(heritageClause, identifiers))) ||
			(child.typeParameters != null && child.typeParameters.some(typeParameter => childReferencesAnyIdentifier(typeParameter, identifiers))) ||
			child.members.some(member => childReferencesAnyIdentifier(member, identifiers))
		);
	}
	else if (isHeritageClause(child)) {
		return child.types.some(type => childReferencesAnyIdentifier(type, identifiers));
	}
	else if (isExpressionWithTypeArguments(child)) {
		return (
			(child.typeArguments != null && child.typeArguments.some(typeArgument => childReferencesAnyIdentifier(typeArgument, identifiers))) || childReferencesAnyIdentifier(child.expression, identifiers)
		);
	}
	else if (isPropertySignature(child)) {
		return (
			(child.initializer != null && childReferencesAnyIdentifier(child.initializer, identifiers)) ||
			(child.type != null && childReferencesAnyIdentifier(child.type, identifiers)) ||
			(child.name != null && childReferencesAnyIdentifier(child.name, identifiers))
		);
	}
	else if (isComputedPropertyName(child)) {
		return child.expression != null && childReferencesAnyIdentifier(child.expression, identifiers);
	}
	else if (isEnumMember(child)) {
		return child.initializer != null && childReferencesAnyIdentifier(child.initializer, identifiers);
	}
	else if (isExportSpecifier(child)) {
		return (child.propertyName != null && childReferencesAnyIdentifier(child.propertyName, identifiers)) || (child.propertyName == null && childReferencesAnyIdentifier(child.name, identifiers));
	}
	else if (isTypeAliasDeclaration(child)) {
		return (
			(child.typeParameters != null && child.typeParameters.some(typeParameter => childReferencesAnyIdentifier(typeParameter, identifiers))) || childReferencesAnyIdentifier(child.type, identifiers)
		);
	}
	else if (isMethodSignature(child)) {
		return (
			(child.typeParameters != null && child.typeParameters.some(typeParameter => childReferencesAnyIdentifier(typeParameter, identifiers))) ||
			(child.type != null && childReferencesAnyIdentifier(child.type, identifiers)) ||
			child.parameters.some(parameter => childReferencesAnyIdentifier(parameter, identifiers)) ||
			child.parameters.some(parameter => childReferencesAnyIdentifier(parameter, identifiers))
		);
	}
	else if (isParameter(child)) {
		return (child.initializer != null && childReferencesAnyIdentifier(child.initializer, identifiers)) || (child.type != null && childReferencesAnyIdentifier(child.type, identifiers));
	}
	else if (isTypeLiteralNode(child)) {
		return child.members.some(member => childReferencesAnyIdentifier(member, identifiers));
	}
	else if (isArrayTypeNode(child)) {
		return childReferencesAnyIdentifier(child.elementType, identifiers);
	}
	else if (isUnionTypeNode(child)) {
		return child.types.some(type => childReferencesAnyIdentifier(type, identifiers));
	}
	else if (isIntersectionTypeNode(child)) {
		return child.types.some(type => childReferencesAnyIdentifier(type, identifiers));
	}
	else if (isTypeQueryNode(child)) {
		return childReferencesAnyIdentifier(child.exprName, identifiers);
	}
	else if (isTypePredicateNode(child)) {
		return childReferencesAnyIdentifier(child.parameterName, identifiers) || childReferencesAnyIdentifier(child.type, identifiers);
	}
	else if (isQualifiedName(child)) {
		return childReferencesAnyIdentifier(child.left, identifiers) || childReferencesAnyIdentifier(child.right, identifiers);
	}
	else if (isParenthesizedTypeNode(child)) {
		return childReferencesAnyIdentifier(child.type, identifiers);
	}
	else if (isTupleTypeNode(child)) {
		return child.elementTypes.some(type => childReferencesAnyIdentifier(type, identifiers));
	}
	else if (isMappedTypeNode(child)) {
		return (child.type != null && childReferencesAnyIdentifier(child.type, identifiers)) || childReferencesAnyIdentifier(child.typeParameter, identifiers);
	}
	else if (isFunctionTypeNode(child)) {
		return (
			child.parameters.some(parameter => childReferencesAnyIdentifier(parameter, identifiers)) ||
			(child.typeParameters != null && child.typeParameters.some(typeParameter => childReferencesAnyIdentifier(typeParameter, identifiers))) ||
			childReferencesAnyIdentifier(child.type, identifiers)
		);
	}
	else if (isVariableDeclaration(child)) {
		return (child.type != null && childReferencesAnyIdentifier(child.type, identifiers)) || (child.initializer != null && childReferencesAnyIdentifier(child.initializer, identifiers));
	}
	else if (isTypeOperatorNode(child)) {
		return childReferencesAnyIdentifier(child.type, identifiers);
	}
	else if (isConditionalTypeNode(child)) {
		return (
			childReferencesAnyIdentifier(child.checkType, identifiers) ||
			childReferencesAnyIdentifier(child.extendsType, identifiers) ||
			childReferencesAnyIdentifier(child.falseType, identifiers) ||
			childReferencesAnyIdentifier(child.trueType, identifiers)
		);
	}
	else if (isLiteralTypeNode(child)) {
		return childReferencesAnyIdentifier(child.literal, identifiers);
	}
	else if (isIndexSignatureDeclaration(child)) {
		return (
			(child.typeParameters != null && child.typeParameters.some(typeParameter => childReferencesAnyIdentifier(typeParameter, identifiers))) ||
			child.parameters.some(parameter => childReferencesAnyIdentifier(parameter, identifiers)) ||
			(child.type != null && childReferencesAnyIdentifier(child.type, identifiers))
		);
	}
	else if (isToken(child)) {
		return false;
	}
	else if (isKeywordTypeNode(child)) {
		return false;
	}
	else if (isImportTypeNode(child)) {
		return false;
	}

	if (DEBUG) {
		console.log("childReferencesAnyIdentifier:", SyntaxKind[child.kind]);
	}
	return false;
}

/**
 * Returns true if any of the given identifiers are referenced by the given Node
 * @param {Identifier[]} identifiers
 * @param {Node} node
 * @returns {boolean}
 */
function identifiersAreReferencedByNode (identifiers: Identifier[], node: Node): boolean {
	if (
		isFunctionDeclaration(node) ||
		isConstructorDeclaration(node) ||
		isMethodDeclaration(node) ||
		isFunctionExpression(node) ||
		isSetAccessorDeclaration(node) ||
		isGetAccessorDeclaration(node) ||
		isArrowFunction(node)
	) {
		return (
			(node.type != null && childReferencesAnyIdentifier(node.type, identifiers)) ||
			node.parameters.some(parameter => childReferencesAnyIdentifier(parameter, identifiers)) ||
			(node.typeParameters != null && node.typeParameters.some(typeParameter => childReferencesAnyIdentifier(typeParameter, identifiers)))
		);
	}
	else if (isClassDeclaration(node) || isClassExpression(node)) {
		return (
			(node.heritageClauses != null && node.heritageClauses.some(heritageClause => childReferencesAnyIdentifier(heritageClause, identifiers))) ||
			node.members.some(member => childReferencesAnyIdentifier(member, identifiers))
		);
	}
	else if (isTypeAliasDeclaration(node)) {
		return (
			(node.type != null && childReferencesAnyIdentifier(node.type, identifiers)) ||
			(node.typeParameters != null && node.typeParameters.some(typeParameter => childReferencesAnyIdentifier(typeParameter, identifiers)))
		);
	}
	else if (isInterfaceDeclaration(node)) {
		return (
			(node.typeParameters != null && node.typeParameters.some(typeParameter => childReferencesAnyIdentifier(typeParameter, identifiers))) ||
			(node.heritageClauses != null && node.heritageClauses.some(heritageClause => childReferencesAnyIdentifier(heritageClause, identifiers))) ||
			node.members.some(member => childReferencesAnyIdentifier(member, identifiers))
		);
	}
	else if (isEnumDeclaration(node)) {
		return node.members.some(member => childReferencesAnyIdentifier(member, identifiers));
	}
	else if (isExportDeclaration(node)) {
		return node.exportClause != null && node.exportClause.elements.some(element => childReferencesAnyIdentifier(element, identifiers));
	}
	else if (isVariableStatement(node)) {
		return node.declarationList.declarations.some(declaration => childReferencesAnyIdentifier(declaration, identifiers));
	}
	else if (isImportDeclaration(node)) {
		return false;
	}
	else {
		return false;
	}
}

/**
 * Returns true if the given exports contains the given identifiers
 * @param {Identifier[]} identifiers
 * @param {Set<string>} usedExports
 * @returns {boolean}
 */
function exportsContainsIdentifiers (identifiers: Identifier[], usedExports: Set<string>): boolean {
	return identifiers.some(identifier => usedExports.has(identifier.text));
}

/**
 * Returns true if the given Node is referenced somewhere in the given SourceFile
 * @param {Node} node
 * @param {SourceFile} sourceFile
 * @param {IReferenceCache} cache
 * @param {Identifier[]} identifiers
 * @returns {boolean}
 */
export function collectReferencingNodes (node: Node, sourceFile: SourceFile, cache: IReferenceCache, identifiers: Identifier[] = getIdentifiersForNode(node, cache)): Node[] {
	if (cache.referencingNodesCache.has(node)) {
		return cache.referencingNodesCache.get(node);
	}

	const nodes: Node[] = [];
	if (identifiers.length < 1) return nodes;

	forEachChild(sourceFile, child => {
		if (node === child || nodeContainsChild(node, child)) return;
		if (identifiersAreReferencedByNode(identifiers, child)) {
			nodes.push(child);
		}
	});

	cache.referencingNodesCache.add(node, ...nodes);
	return nodes;
}
