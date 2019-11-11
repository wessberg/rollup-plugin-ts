import {Resolver} from "../resolve-id/resolver";
import {IncrementalLanguageService} from "../../service/language-service/incremental-language-service";
import {
	CallExpression,
	ExportDeclaration,
	forEachChild,
	ImportDeclaration,
	ImportTypeNode,
	isCallExpression,
	isExportDeclaration,
	isImportDeclaration,
	isImportTypeNode,
	isLiteralTypeNode,
	isStringLiteralLike,
	Node,
	SyntaxKind
} from "typescript";
import {extname, normalize} from "path";
import {SupportedExtensions} from "../get-supported-extensions/get-supported-extensions";

export type ModuleDependencyMap = Map<string, Set<string>>;

export interface GetModuleDependenciesOptions {
	resolver: Resolver;
	file: string;
	languageServiceHost: IncrementalLanguageService;
	supportedExtensions: SupportedExtensions;
	cache: Map<string, Set<string>>;
}

export function getModuleDependencies(
	{file, languageServiceHost, resolver, supportedExtensions, cache}: GetModuleDependenciesOptions,
	dependencies = new Set<string>(),
	visited = new Set<string>()
): Set<string> {
	visited.add(file);
	if (cache.has(file)) {
		return cache.get(file)!;
	}

	const sourceFile = languageServiceHost.getSourceFile(file);
	if (sourceFile == null) return dependencies;

	const localDependencies = new Set<string>();

	const addDependency = (resolvedFileName: string) => {
		const dependency = normalize(resolvedFileName);
		const code = languageServiceHost.readFile(dependency);
		if (code != null) {
			localDependencies.add(dependency);

			if (supportedExtensions.has(extname(dependency))) {
				languageServiceHost.addFile({file: dependency, code});
			}
		}
	};

	function visitImportOrExportDeclaration(node: ImportDeclaration | ExportDeclaration): ImportDeclaration | ExportDeclaration {
		const specifier = node.moduleSpecifier;
		if (specifier == null || !isStringLiteralLike(specifier)) return node;

		const resolved = resolver(specifier.text, sourceFile!.fileName);
		if (resolved != null) {
			addDependency(resolved);
		}
		return node;
	}

	function visitImportTypeNode(node: ImportTypeNode): ImportTypeNode {
		if (!isLiteralTypeNode(node.argument) || !isStringLiteralLike(node.argument.literal)) return node;
		const specifier = node.argument.literal;

		const resolved = resolver(specifier.text, sourceFile!.fileName);
		if (resolved != null) {
			addDependency(resolved);
		}
		return node;
	}

	function visitCallExpression(node: CallExpression): CallExpression {
		if (node.expression.kind !== SyntaxKind.ImportKeyword) return node;
		const [specifier] = node.arguments;
		if (specifier == null || !isStringLiteralLike(specifier)) return node;

		const resolved = resolver(specifier.text, sourceFile!.fileName);
		if (resolved != null) {
			addDependency(resolved);
		}
		return node;
	}

	/**
	 * Visits the given Node
	 * @param {Node} node
	 * @returns {Node | undefined}
	 */
	function visitor(node: Node): void {
		if (isImportDeclaration(node) || isExportDeclaration(node)) {
			visitImportOrExportDeclaration(node);
		} else if (isImportTypeNode(node)) {
			visitImportTypeNode(node);
		} else if (isCallExpression(node)) {
			visitCallExpression(node);
		}

		forEachChild(node, visitor);
	}

	forEachChild(sourceFile, visitor);

	for (const nextFile of localDependencies) {
		if (!visited.has(nextFile)) {
			getModuleDependencies({file: nextFile, languageServiceHost, resolver, supportedExtensions, cache}, dependencies, visited);
		}
		dependencies.add(nextFile);
	}

	cache.set(file, dependencies);
	return dependencies;
}
