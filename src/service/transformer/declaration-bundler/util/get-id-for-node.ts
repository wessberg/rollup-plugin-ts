import type {GetSymbolAtLocationOptions} from "./get-symbol-at-location.js";
import {getSymbolAtLocation} from "./get-symbol-at-location.js";
import type {TS} from "../../../../type/ts.js";
import {generateRandomHash, generateRandomIntegerHash} from "../../../../util/hash/generate-random-hash.js";
import {getOriginalNode} from "./get-original-node.js";
import {getParentNode} from "./get-parent-node.js";
import {getAliasedDeclaration} from "./get-aliased-declaration.js";
import type {SafeNode} from "../../../../type/safe-node.js";

/**
 * According to TypeScript, multiple namespace imports, identically named, from the same module may have different IDs, because they are all local bindings in their respective modules.
 * For example, in files a.ts and b.ts, both may include 'import * as Foo from "foo"', but the ids of 'Foo' will be unique for each SourceFile, given that it is indeed separate local bindings of Foo,
 * and they aren't equal to each other. However, we're merging ImportDeclarations here, and so, structurally identical imported bindings should share ids. This function makes sure to generate an id
 * that is shared for structurally identical NamespaceImports
 */
function getIdForNamespaceImportName(options: GetSymbolAtLocationOptions & {node: TS.Identifier}): number {
	const {node} = options;
	const originalNode = getOriginalNode(node, options.typescript) as TS.Identifier & {parent: TS.NamespaceImport};
	const moduleSpecifier = getParentNode(getParentNode(getParentNode(originalNode))).moduleSpecifier;

	return generateRandomIntegerHash({
		key: `NamespaceImport:${node.text}:${moduleSpecifier == null || !options.typescript.isStringLiteralLike(moduleSpecifier) ? generateRandomHash() : moduleSpecifier.text}`,
		length: 100
	});
}

/**
 * According to TypeScript, multiple import specifiers, identically named, from the same module may have different IDs, because they are all local bindings in their respective modules.
 * For example, in files a.ts and b.ts, both may include 'import {foo} from "foo"', but the ids of 'foo' will be unique for each SourceFile, given that it is indeed separate local bindings of foo,
 * and they aren't equal to each other. However, we're merging ImportDeclarations here, and so, structurally identical imported bindings should share ids. This function makes sure to generate an id
 * that is shared for structurally identical ImportSpecifiers
 */
function getIdForImportSpecifier(options: GetSymbolAtLocationOptions & {node: TS.Identifier}): number {
	const {node} = options;
	const originalNode = getOriginalNode(node, options.typescript) as TS.Identifier & {parent: TS.ImportSpecifier};
	const moduleSpecifier = getParentNode(getParentNode(getParentNode(getParentNode(originalNode)))).moduleSpecifier;

	return generateRandomIntegerHash({
		key: `${node.text === "default" ? "name" : "ImportSpecifier"}:${node.text}:${
			moduleSpecifier == null || !options.typescript.isStringLiteralLike(moduleSpecifier) ? generateRandomHash() : moduleSpecifier.text
		}`,
		length: 100
	});
}

/**
 * According to TypeScript, multiple default imports, identically named, from the same module may have different IDs, because they are all local bindings in their respective modules.
 * For example, in files a.ts and b.ts, both may include 'import Foo from "foo"', but the ids of 'Foo' will be unique for each SourceFile, given that it is indeed separate local bindings of Foo,
 * and they aren't equal to each other. However, we're merging ImportDeclarations here, and so, structurally identical imported bindings should share ids. This function makes sure to generate an id
 * that is shared for structurally identical imported names
 */
function getIdForImportedName(options: GetSymbolAtLocationOptions & {node: TS.Identifier}): number {
	const {node} = options;
	const originalNode = getOriginalNode(node, options.typescript) as TS.Identifier & {parent: TS.ImportClause};
	const moduleSpecifier = getParentNode(getParentNode(originalNode)).moduleSpecifier;

	return generateRandomIntegerHash({
		key: `name:${node.text}:${moduleSpecifier == null || !options.typescript.isStringLiteralLike(moduleSpecifier) ? generateRandomHash() : moduleSpecifier.text}`,
		length: 100
	});
}

function getIdForStructurallyEqualNode(options: GetSymbolAtLocationOptions): number | undefined {
	if (options.typescript.isImportSpecifier(options.node)) {
		return getIdForImportSpecifier({...options, node: options.node.name});
	} else if (options.typescript.isNamespaceImport(options.node)) {
		return getIdForNamespaceImportName({...options, node: options.node.name});
	} else if (options.typescript.isImportClause(options.node) && options.node.name != null) {
		return getIdForImportedName({...options, node: options.node.name});
	} else {
		return undefined;
	}
}

export function getIdForNode(options: GetSymbolAtLocationOptions): number | undefined {
	if (options.typescript.isExportSpecifier(options.node)) {
		const aliasedDeclaration = getAliasedDeclaration(options);
		if (aliasedDeclaration != null && (aliasedDeclaration as SafeNode) !== options.node) {
			return getIdForNode({...options, node: aliasedDeclaration});
		}
	}

	const importRelatedId = getIdForStructurallyEqualNode(options);
	if (importRelatedId != null) {
		return importRelatedId;
	} else if (options.typescript.isIdentifier(options.node)) {
		const parent = getParentNode(options.node) ?? getParentNode(getOriginalNode(options.node, options.typescript));

		if (parent != null) {
			const parentImportRelatedId = getIdForStructurallyEqualNode({...options, node: parent});
			if (parentImportRelatedId != null) return parentImportRelatedId;
		}
	}

	const symbol = getSymbolAtLocation(options);
	if (symbol == null) return undefined;
	let declaration: ((TS.Declaration | TS.Type) & {id?: number}) | undefined;

	if (symbol.declarations != null) {
		declaration = symbol.declarations[0];
	} else if (symbol.valueDeclaration != null) {
		declaration = symbol.valueDeclaration;
	} else if ("type" in symbol) {
		declaration = (symbol as unknown as {type: TS.Type}).type;
	}

	if (declaration == null) return undefined;

	return declaration.id;
}
