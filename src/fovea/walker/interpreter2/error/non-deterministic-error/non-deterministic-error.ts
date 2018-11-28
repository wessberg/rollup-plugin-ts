import {EvaluationError} from "../evaluation-error/evaluation-error";
import {INonDeterministicErrorOptions} from "./i-non-deterministic-error-options";

/**
 * An Error that can be thrown when something nondeterministic is attempted to be evaluated and has been disallowed to be so
 */
export class NonDeterministicError extends EvaluationError {
	constructor (options?: INonDeterministicErrorOptions) {
		super(options);
	}
}