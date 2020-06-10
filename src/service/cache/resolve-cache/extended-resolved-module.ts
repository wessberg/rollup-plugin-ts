import {TS} from "../../../type/ts";

export interface ExtendedResolvedModule extends Omit<TS.ResolvedModuleFull, "resolvedFileName"> {
	resolvedFileName: string | undefined;
	resolvedAmbientFileName: string | undefined;
}
