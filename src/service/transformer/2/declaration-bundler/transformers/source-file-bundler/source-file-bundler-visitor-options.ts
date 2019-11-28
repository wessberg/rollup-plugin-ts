import {TS} from "../../../../../../type/ts";
import {DeclarationBundlerOptions} from "../../declaration-bundler-options";
import {LexicalEnvironment} from "../deconflicter/deconflicter-options";

export interface SourceFileBundlerVisitorOptions extends DeclarationBundlerOptions {
	context: TS.TransformationContext;
	sourceFile: TS.SourceFile;
	otherSourceFiles: TS.SourceFile[];
	lexicalEnvironment: LexicalEnvironment;
}
