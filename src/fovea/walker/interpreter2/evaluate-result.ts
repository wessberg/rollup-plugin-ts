import {Literal} from "./literal/literal";
import {EvaluationError} from "./error/evaluation-error/evaluation-error";

export interface IEvaluateResultBase {
	success: boolean;
}

export interface IEvaluateSuccessResult extends IEvaluateResultBase {
	success: true;
	value: Literal;
}

export interface IEvaluateFailureResult extends IEvaluateResultBase {
	success: false;
	reason: EvaluationError;
}

export type EvaluateResult = IEvaluateSuccessResult|IEvaluateFailureResult;