import {TS} from "../../../../type/ts";

export interface TreeShakerVisitorOptions<T extends TS.Node> {
	typescript: typeof TS;
	node: T;
	sourceFile: TS.SourceFile;
	continuation<U extends TS.Node>(node: U): U | undefined;
	isReferenced(node: TS.Node): boolean;
}
