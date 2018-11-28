import {Node} from "typescript";
import {EvaluationError} from "../evaluation-error/evaluation-error";
import {IMaxOpsExceededErrorOptions} from "./i-max-ops-exceeded-error-options";

/**
 * An Error that can be thrown when an unexpected node is encountered
 */
export class MaxOpsExceededError extends EvaluationError {
	public readonly node: Node;
	constructor (options?: IMaxOpsExceededErrorOptions) {
		super(options);
	}
}