import {Node} from "typescript";
import {IEvaluationErrorOptions} from "../evaluation-error/i-evaluation-error-options";

export interface IUnexpectedNodeErrorOptions extends IEvaluationErrorOptions {
	node: Node;
}