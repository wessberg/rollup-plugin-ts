import {Node} from "typescript";
import {SourceFileContext} from "../../../shared/i-source-file-context";
import {LexicalEnvironment} from "../../lexical-environment/lexical-environment";

export interface IGetLiteralValueOptions {
	node: Node;
	context: SourceFileContext;
	environment?: LexicalEnvironment;
}