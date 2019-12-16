import {SourceDescription, SourceMap} from "rollup";
import {setExtension} from "../util/path/path-util";
import {DECLARATION_MAP_EXTENSION, JS_EXTENSION} from "../constant/constant";
import {IncrementalLanguageService} from "../service/language-service/incremental-language-service";
import {DeclarationBundlerOptions} from "../service/transformer/declaration-bundler/declaration-bundler-options";
import {declarationBundler} from "../service/transformer/declaration-bundler/declaration-bundler";

export interface PreBundleDeclarationsForChunkOptions extends Omit<DeclarationBundlerOptions, "typeChecker"> {
	cwd: string;
	generateMap: boolean;
	languageServiceHost: IncrementalLanguageService;
}

export function bundleDeclarationsForChunk(options: PreBundleDeclarationsForChunkOptions): SourceDescription {
	let code = "";
	let map: SourceMap | undefined;
	const {outDir, ...compilationSettings} = options.languageServiceHost.getCompilationSettings();

	const program = options.typescript.createProgram({
		rootNames: options.chunk.modules,
		options: {
			...compilationSettings,
			outFile: setExtension(options.declarationPaths.relative, JS_EXTENSION),
			module: options.typescript.ModuleKind.System,
			emitDeclarationOnly: true
		},
		host: options.languageServiceHost
	});

	const typeChecker = program.getTypeChecker();

	program.emit(
		undefined,
		(file, data) => {
			if (file.endsWith(DECLARATION_MAP_EXTENSION)) {
				map = JSON.parse(data);
			} else {
				code += data;
			}
		},
		undefined,
		true,
		declarationBundler({
			...options,
			typeChecker
		})
	);

	if (options.pluginOptions.debug && map != null) {
		console.log(`=== MAP === (${options.chunk.paths.absolute})`);
		console.log(map);
	}

	return {
		code,
		...(map == null ? {} : {map: JSON.stringify(map)})
	};
}
