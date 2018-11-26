import {Literal} from "./literal/literal";
import {EvaluateFailure} from "./evaluate-failure";

export interface IEvaluateResultBase {
	success: boolean;
}

export interface IEvaluateSuccessResult extends IEvaluateResultBase {
	success: true;
	value: Literal;
}

export interface IEvaluateFailureResult extends IEvaluateResultBase {
	success: false;
	reason: EvaluateFailure;
}

export type EvaluateResult = IEvaluateSuccessResult|IEvaluateFailureResult;