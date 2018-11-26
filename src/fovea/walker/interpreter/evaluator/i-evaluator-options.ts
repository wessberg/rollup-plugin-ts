import {Node, NodeArray} from "typescript";
import {IContinuation, IContinuationFactory} from "./continuation-function";
import {SourceFileContext} from "../../shared/i-source-file-context";
import {LexicalEnvironment} from "../lexical-environment/lexical-environment";

export interface IEvaluatorOptions<T extends (Node|NodeArray<Node>)> {
	node: T;
	context: SourceFileContext;
	continuation: IContinuation;
	continuationFactory: IContinuationFactory;
	initialEnvironment: LexicalEnvironment;
	environment: LexicalEnvironment;
	deterministic: boolean;
}