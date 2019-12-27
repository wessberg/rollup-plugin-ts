import {SourceDescription, SourceMap} from "rollup";
import {setExtension} from "../util/path/path-util";
import {DECLARATION_MAP_EXTENSION, JS_EXTENSION} from "../constant/constant";
import {IncrementalLanguageService} from "../service/language-service/incremental-language-service";
import {DeclarationBundlerOptions} from "../service/transformer/declaration-bundler/declaration-bundler-options";
import {declarationBundler} from "../service/transformer/declaration-bundler/declaration-bundler";

export interface BundleDeclarationsForChunkOptions extends Omit<DeclarationBundlerOptions, "typeChecker"> {
	cwd: string;
	generateMap: boolean;
	languageServiceHost: IncrementalLanguageService;
}

export function bundleDeclarationsForChunk(options: BundleDeclarationsForChunkOptions): SourceDescription {
	let code = "";
	let map: SourceMap | undefined;
	const {outDir, ...compilationSettings} = options.languageServiceHost.getCompilationSettings();
	options.languageServiceHost.getSourceFiles();

	const program = options.typescript.createProgram({
		rootNames: [...options.chunk.allModules],
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
			compilerOptions: program.getCompilerOptions(),
			typeChecker
		})
	);

	return {
		code,
		...(map == null ? {} : {map: JSON.stringify(map)})
	};
}
