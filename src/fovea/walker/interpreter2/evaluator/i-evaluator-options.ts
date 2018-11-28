import {Node} from "typescript";
import {SourceFileContext} from "../../shared/i-source-file-context";
import {LexicalEnvironment} from "../lexical-environment/lexical-environment";
import {Continuation} from "../continuation/continuation";
import {NodeEvaluator} from "./node-evaluator/node-evaluator";

export interface IEvaluatorOptions<T extends Node> {
	node: T;
	context: SourceFileContext;
	evaluate: NodeEvaluator;
	continuation: Continuation;
	initialEnvironment: LexicalEnvironment;
	environment: LexicalEnvironment;
	deterministic: boolean;
}