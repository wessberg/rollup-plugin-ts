import {Node} from "typescript";
import {LexicalEnvironment} from "../../lexical-environment/lexical-environment";
import {Continuation} from "../../continuation/continuation";

export type NodeEvaluator = (node: Node, environment: LexicalEnvironment, continuation: Continuation) => void;