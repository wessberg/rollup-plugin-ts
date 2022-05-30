import {CompilerHost} from "../../service/compiler-host/compiler-host.js";
import {ExtendedResolvedModule} from "../../service/cache/resolve-cache/extended-resolved-module.js";
import {getExtension} from "../path/path-util.js";
import {D_TS_EXTENSION} from "../../constant/constant.js";
import {trackDependenciesTransformer} from "../../service/transformer/declaration-bundler/transformers/track-dependencies-transformer/track-dependencies-transformer.js";

export interface GetModuleDependenciesOptions {
	compilerHost: CompilerHost;
	module: string;
}

export interface ModuleDependency extends ExtendedResolvedModule {
	moduleSpecifier: string;
}

export function getModuleDependencies(options: GetModuleDependenciesOptions): Set<ModuleDependency> | undefined {
	// Skip .d.ts files
	if (getExtension(options.module) === D_TS_EXTENSION) return undefined;

	const cachedDependencies = options.compilerHost.getDependenciesForFile(options.module);

	if (cachedDependencies != null) {
		return cachedDependencies;
	}

	const sourceFile = options.compilerHost.getSourceFile(options.module);
	if (sourceFile == null) {
		return;
	}

	return trackDependenciesTransformer({
		host: options.compilerHost,
		sourceFile
	});
}
