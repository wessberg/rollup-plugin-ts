import {Resolver} from "../../../../util/resolve-id/resolver";
import {ModuleSpecifierToSourceFileMap} from "../declaration-bundler-options";
import {TS} from "../../../../type/ts";

export interface ResolveSourceFileFromModuleSpecifierOptions {
	moduleSpecifierToSourceFileMap: ModuleSpecifierToSourceFileMap;
	resolver: Resolver;
	from: string;
	moduleSpecifier: string;
	sourceFiles: TS.SourceFile[];
}

export function resolveSourceFileFromModuleSpecifier({
	moduleSpecifier,
	from,
	moduleSpecifierToSourceFileMap,
	resolver,
	sourceFiles
}: ResolveSourceFileFromModuleSpecifierOptions): TS.SourceFile | undefined {
	const sourceFile = moduleSpecifierToSourceFileMap.get(moduleSpecifier) ?? moduleSpecifierToSourceFileMap.get(`${moduleSpecifier}/index`);
	if (sourceFile != null) return sourceFile;

	if (moduleSpecifier.startsWith(".")) {
		const resolved = resolver(moduleSpecifier, from);
		if (resolved == null) return undefined;
		return sourceFiles.find(existingSourceFile => existingSourceFile.fileName === resolved.fileName);
	}
	return undefined;
}
