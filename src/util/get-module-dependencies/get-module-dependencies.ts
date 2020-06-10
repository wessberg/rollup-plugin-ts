import {CompilerHost} from "../../service/compiler-host/compiler-host";
import {ExtendedResolvedModule} from "../../service/cache/resolve-cache/extended-resolved-module";
import {getExtension} from "../path/path-util";
import {D_TS_EXTENSION} from "../../constant/constant";
import {trackDependenciesTransformer} from "../../service/transformer/declaration-bundler/transformers/track-dependencies-transformer/track-dependencies-transformer";

export interface GetModuleDependenciesOptions {
	compilerHost: CompilerHost;
	module: string;
}

export function getModuleDependencies(options: GetModuleDependenciesOptions): Set<ExtendedResolvedModule> | undefined {
	// Skip .d.ts files
	if (getExtension(options.module) === D_TS_EXTENSION) return undefined;

	const cachedDependencies = options.compilerHost.getDependenciesForFile(options.module);

	if (cachedDependencies != null) {
		return cachedDependencies;
	}

	const typescript = options.compilerHost.getTypescript();
	const sourceFile = options.compilerHost.getSourceFile(options.module);
	if (sourceFile == null) {
		return;
	}

	return trackDependenciesTransformer({
		host: options.compilerHost,
		typescript,
		sourceFile
	});
}
