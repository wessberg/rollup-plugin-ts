import {SourceDescription, SourceMap} from "rollup";
import {setExtension} from "../util/path/path-util";
import {DECLARATION_MAP_EXTENSION, JS_EXTENSION} from "../constant/constant";
import {IncrementalLanguageService} from "../service/language-service/incremental-language-service";
import {DeclarationBundlerOptions} from "../service/transformer/2/declaration-bundler/declaration-bundler-options";
import {declarationBundler} from "../service/transformer/2/declaration-bundler/declaration-bundler";

export interface PreBundleDeclarationsForChunkOptions extends Omit<DeclarationBundlerOptions, "typeChecker"> {
	cwd: string;
	generateMap: boolean;
	languageServiceHost: IncrementalLanguageService;
}

export function bundleDeclarationsForChunk(options: PreBundleDeclarationsForChunkOptions): SourceDescription {
	let code = "";
	let map: SourceMap | undefined;

	const program = options.typescript.createProgram({
		rootNames: options.modules,
		options: {
			...options.languageServiceHost.getCompilationSettings(),
			outFile: setExtension(options.declarationFilename, JS_EXTENSION),
			module: options.typescript.ModuleKind.System,
			emitDeclarationOnly: true
		},
		host: options.languageServiceHost
	});

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
		declarationBundler(options)
	);

	return {
		code,
		map
	};
}
