import {IGetEmitOutputWithCachingOptions} from "./i-get-emit-output-with-caching-options";
import {TS} from "../../../type/ts";

export interface IEmitCache {
	getFromCache(fileName: string, dtsOnly?: boolean): TS.EmitOutput | undefined;
	delete(fileName: string): boolean;
	setInCache(emitOutput: TS.EmitOutput, fileName: string, dtsOnly?: boolean): TS.EmitOutput;
	get(options: IGetEmitOutputWithCachingOptions): TS.EmitOutput;
}
