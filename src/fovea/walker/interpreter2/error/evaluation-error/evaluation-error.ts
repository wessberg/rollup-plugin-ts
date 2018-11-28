import {IEvaluationErrorOptions} from "./i-evaluation-error-options";

/**
 * A Base class for EvaluationErrors
 */
export abstract class EvaluationError extends Error {
	protected constructor ({message}: IEvaluationErrorOptions = {}) {
		super(message);
		Error.captureStackTrace(this, this.constructor);
	}
}