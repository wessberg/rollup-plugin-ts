import {TS} from "../../../../type/ts";

export interface TransformerBaseOptions {
	sourceFile: TS.SourceFile;
	typescript: typeof TS;
	factory: TS.NodeFactory;
}
