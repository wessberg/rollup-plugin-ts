import {EmitOutput} from "typescript";
import {IGetEmitOutputWithCachingOptions} from "./i-get-emit-output-with-caching-options";

export interface IEmitCache {
	getFromCache(fileName: string, dtsOnly?: boolean): EmitOutput | undefined;
	delete(fileName: string): boolean;
	setInCache(emitOutput: EmitOutput, fileName: string, dtsOnly?: boolean): EmitOutput;
	get(options: IGetEmitOutputWithCachingOptions): EmitOutput;
}
