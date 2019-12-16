import {Resolver} from "../resolve-id/resolver";
import {IncrementalLanguageService} from "../../service/language-service/incremental-language-service";
import {extname, normalize} from "path";
import {SupportedExtensions} from "../get-supported-extensions/get-supported-extensions";
import {TS} from "../../type/ts";

export type ModuleDependencyMap = Map<string, Set<string>>;

export interface GetModuleDependenciesOptions {
	resolver: Resolver;
	typescript: typeof TS;
	file: string;
	languageServiceHost: IncrementalLanguageService;
	supportedExtensions: SupportedExtensions;
	cache: Map<string, Set<string>>;
}

export function getModuleDependencies(
	{file, languageServiceHost, resolver, supportedExtensions, cache, typescript}: GetModuleDependenciesOptions,
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

	function visitImportOrExportDeclaration(node: TS.ImportDeclaration | TS.ExportDeclaration): TS.ImportDeclaration | TS.ExportDeclaration {
		const specifier = node.moduleSpecifier;
		if (specifier == null || !typescript.isStringLiteralLike(specifier)) return node;

		const resolved = resolver(specifier.text, sourceFile!.fileName);
		if (resolved != null) {
			addDependency(resolved.fileName);
		}
		return node;
	}

	function visitImportTypeNode(node: TS.ImportTypeNode): TS.ImportTypeNode {
		if (!typescript.isLiteralTypeNode(node.argument) || !typescript.isStringLiteralLike(node.argument.literal)) return node;
		const specifier = node.argument.literal;

		const resolved = resolver(specifier.text, sourceFile!.fileName);
		if (resolved != null) {
			addDependency(resolved.fileName);
		}
		return node;
	}

	function visitCallExpression(node: TS.CallExpression): TS.CallExpression {
		if (node.expression.kind !== typescript.SyntaxKind.ImportKeyword) return node;
		const [specifier] = node.arguments;
		if (specifier == null || !typescript.isStringLiteralLike(specifier)) return node;

		const resolved = resolver(specifier.text, sourceFile!.fileName);
		if (resolved != null) {
			addDependency(resolved.fileName);
		}
		return node;
	}

	/**
	 * Visits the given Node
	 */
	function visitor(node: TS.Node): void {
		if (typescript.isImportDeclaration(node) || typescript.isExportDeclaration(node)) {
			visitImportOrExportDeclaration(node);
			// ImportTypeNode may not be part of the current Typescript version, hence the optional call
		} else if (typescript.isImportTypeNode?.(node)) {
			visitImportTypeNode(node);
		} else if (typescript.isCallExpression(node)) {
			visitCallExpression(node);
		}

		typescript.forEachChild(node, visitor);
	}

	typescript.forEachChild(sourceFile, visitor);

	for (const nextFile of localDependencies) {
		if (!visited.has(nextFile)) {
			getModuleDependencies({file: nextFile, languageServiceHost, resolver, supportedExtensions, cache, typescript}, dependencies, visited);
		}
		dependencies.add(nextFile);
	}

	cache.set(file, dependencies);
	return dependencies;
}
