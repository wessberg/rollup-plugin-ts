import {OutputOptions, RenderedChunk} from "rollup";
import {CompilerOptions} from "typescript";
import {DeclarationCompilerHost} from "../../service/compiler-host/declaration-compiler-host";

export interface IEmitDeclarationsOptions {
	cwd: string;
	chunk: RenderedChunk;
	outputOptions: OutputOptions;
	compilerOptions: CompilerOptions;
	compilerHost: DeclarationCompilerHost;
	declarationCompilerOptions: CompilerOptions;
}