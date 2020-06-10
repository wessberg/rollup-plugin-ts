import {TS} from "../../type/ts";
import {getScriptKindFromPath} from "../get-script-kind-from-path/get-script-kind-from-path";

export interface GenerateSourceFileOptions {
	file: string;
	code: string;
	typescript: typeof TS;
	compilerOptions: TS.CompilerOptions;
}

export function generateSourceFile({code, compilerOptions, file, typescript}: GenerateSourceFileOptions): TS.SourceFile {
	return typescript.createSourceFile(file, code, compilerOptions.target ?? typescript.ScriptTarget.ES3, true, getScriptKindFromPath(file, typescript));
}
