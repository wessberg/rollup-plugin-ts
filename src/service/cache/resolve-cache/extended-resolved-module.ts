import {TS} from "../../../type/ts.js";

export interface ExtendedResolvedModule extends Omit<TS.ResolvedModuleFull, "resolvedFileName"> {
	resolvedFileName: string | undefined;
	resolvedAmbientFileName: string | undefined;
}
