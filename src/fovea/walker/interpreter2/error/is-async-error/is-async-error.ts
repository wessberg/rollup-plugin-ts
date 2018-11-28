import {EvaluationError} from "../evaluation-error/evaluation-error";
import {IIsAsyncErrorOptions} from "./i-is-async-error-options";

/**
 * An Error that can be thrown when something async is attempted to be evaluated and has been disallowed to be so
 */
export class IsAsyncError extends EvaluationError {
	constructor (options?: IIsAsyncErrorOptions) {
		super(options);
	}
}