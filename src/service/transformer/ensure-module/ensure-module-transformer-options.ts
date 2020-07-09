import {TS} from "../../../type/ts";
import {CompatFactory} from "../declaration-bundler/transformers/source-file-bundler/source-file-bundler-visitor-options";

export interface EnsureModuleTransformerOptions {
	typescript: typeof TS;
	compatFactory: CompatFactory;
	sourceFile: TS.SourceFile;
}
