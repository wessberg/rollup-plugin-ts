import {TS} from "../../../type/ts";

export interface EnsureModuleTransformerOptions {
	typescript: typeof TS;
	sourceFile: TS.SourceFile;
}
