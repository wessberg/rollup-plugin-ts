import type {SourceDescription, SourceMap} from "rollup";
import {D_TS_EXTENSION, D_TS_MAP_EXTENSION, SOURCE_MAP_COMMENT, SOURCE_MAP_COMMENT_REGEXP} from "../../../constant/constant.js";
import {declarationBundler} from "../../transformer/declaration-bundler/declaration-bundler.js";
import type {DeclarationBundlerOptions} from "../../transformer/declaration-bundler/declaration-bundler-options.js";

export interface BundleDeclarationsForChunkOptions extends DeclarationBundlerOptions {}

export interface BundleDeclarationsForChunkResult extends SourceDescription {}

export function bundleDeclarationsForChunk(options: BundleDeclarationsForChunkOptions): BundleDeclarationsForChunkResult {
	let code = "";
	let map: SourceMap | undefined;

	const emitOutput = options.host.emit(undefined, true, declarationBundler(options));

	for (const {name, text} of emitOutput.outputFiles) {
		if (name.endsWith(D_TS_MAP_EXTENSION)) {
			map = JSON.parse(text) as SourceMap;
			map.file = options.declarationPaths.fileName;
		} else if (name.endsWith(D_TS_EXTENSION)) {
			code += text.replace(SOURCE_MAP_COMMENT_REGEXP, `${SOURCE_MAP_COMMENT}=${options.declarationMapPaths.fileName}`);
		}
	}

	return {
		code,
		...(map == null ? {} : {map: JSON.stringify(map)})
	};
}
