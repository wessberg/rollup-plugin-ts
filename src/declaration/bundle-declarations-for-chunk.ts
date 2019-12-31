import {SourceDescription, SourceMap} from "rollup";
import {DECLARATION_MAP_EXTENSION, SOURCE_MAP_COMMENT, SOURCE_MAP_COMMENT_REGEXP} from "../constant/constant";
import {declarationBundler} from "../service/transformer/declaration-bundler/declaration-bundler";
import {DeclarationBundlerOptions} from "../service/transformer/declaration-bundler/declaration-bundler-options";
import {TS} from "../type/ts";

export interface BundleDeclarationsForChunkOptions extends Omit<DeclarationBundlerOptions, "typeChecker"> {
	cwd: string;
	generateMap: boolean;
	program: TS.Program;
	typeChecker: TS.TypeChecker;
}

export function bundleDeclarationsForChunk(options: BundleDeclarationsForChunkOptions): SourceDescription {
	let code = "";
	let map: SourceMap | undefined;
	const {program, typeChecker} = options;

	program.emit(
		undefined,
		(file: string, data: string) => {
			if (file.endsWith(DECLARATION_MAP_EXTENSION)) {
				map = JSON.parse(data) as SourceMap;
				map.file = options.declarationPaths.fileName;
			} else {
				code += data.replace(SOURCE_MAP_COMMENT_REGEXP, `${SOURCE_MAP_COMMENT}=${options.declarationMapPaths.fileName}`);
			}
		},
		undefined,
		true,
		declarationBundler({
			...options,
			compilerOptions: program.getCompilerOptions(),
			typeChecker
		}),
		// There is an additional hidden undocumented argument that can be provided that ensures that declarations will be emitted, no matter what
		// @ts-ignore
		true
	);

	return {
		code,
		...(map == null ? {} : {map: JSON.stringify(map)})
	};
}
