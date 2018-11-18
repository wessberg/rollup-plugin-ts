import {Node} from "typescript";
import {EvaluatorContinuation} from "./evaluator-continuation";
import {SourceFileContext} from "../../../../shared/i-source-file-context";
import {LexicalEnvironment} from "../../../lexical-environment/lexical-environment";

export interface IEvaluatorOptions<T extends Node> {
	node: T;
	context: SourceFileContext;
	continuation: EvaluatorContinuation;
	environment: LexicalEnvironment;
}