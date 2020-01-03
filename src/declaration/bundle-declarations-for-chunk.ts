import {SourceDescription, SourceMap} from "rollup";
import {DECLARATION_MAP_EXTENSION, SOURCE_MAP_COMMENT, SOURCE_MAP_COMMENT_REGEXP} from "../constant/constant";
import {declarationBundler} from "../service/transformer/declaration-bundler/declaration-bundler";
import {DeclarationBundlerOptions} from "../service/transformer/declaration-bundler/declaration-bundler-options";
import {CompilerHost} from "../service/compiler-host/compiler-host";
import {TS} from "../type/ts";

export interface BundleDeclarationsForChunkOptions extends Omit<DeclarationBundlerOptions, "typeChecker"> {
	cwd: string;
	generateMap: boolean;
	host: CompilerHost;
	typeChecker: TS.TypeChecker;
}

export function bundleDeclarationsForChunk(options: BundleDeclarationsForChunkOptions): SourceDescription {
	let code = "";
	let map: SourceMap | undefined;

	const emitOutput = options.host.emit(undefined, true, declarationBundler(options));

	for (const {name, text} of emitOutput.outputFiles) {
		if (name.endsWith(DECLARATION_MAP_EXTENSION)) {
			map = JSON.parse(text) as SourceMap;
			map.file = options.declarationPaths.fileName;
		} else {
			code += text.replace(SOURCE_MAP_COMMENT_REGEXP, `${SOURCE_MAP_COMMENT}=${options.declarationMapPaths.fileName}`);
		}
	}

	return {
		code,
		...(map == null ? {} : {map: JSON.stringify(map)})
	};
}
