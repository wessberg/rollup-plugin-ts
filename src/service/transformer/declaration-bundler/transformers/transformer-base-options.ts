import type {TS} from "../../../../type/ts.js";
import type {SupportedExtensions} from "../../../../util/get-supported-extensions/get-supported-extensions.js";

export interface TransformerBaseOptions {
	sourceFile: TS.SourceFile;
	typescript: typeof TS;
	factory: TS.NodeFactory;
	extensions: SupportedExtensions;
}
