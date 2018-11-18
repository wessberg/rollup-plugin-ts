import {Node} from "typescript";
import {LiteralResult} from "../../../literal/literal";
import {LexicalEnvironment} from "../../../lexical-environment/lexical-environment";

export type EvaluatorContinuation = (node: Node, environment: LexicalEnvironment) => LiteralResult;