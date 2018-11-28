import {Node} from "typescript";
import {SourceFileContext} from "../shared/i-source-file-context";
import {LexicalEnvironment} from "./lexical-environment/lexical-environment";

export interface IEvaluateOptions {
	node: Node;
	context: SourceFileContext;
	environment?: LexicalEnvironment["env"];
	deterministic?: boolean;
	maxOps?: number;
}