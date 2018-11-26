export const enum EvaluateFailureKind {
	DID_THROW = "DID_THROW",
	IS_ASYNC = "IS_ASYNC",
	MAX_OPS_EXCEEDED = "MAX_OPS_EXCEEDED",
	NONDETERMINISTIC = "NONDETERMINISTIC"
}

export interface IEvaluateFailure {
	kind: EvaluateFailureKind;
}

export interface IEvaluateMaxOpsExceededFailure extends IEvaluateFailure {
	kind: EvaluateFailureKind.MAX_OPS_EXCEEDED;
}

export interface IEvaluateDidThrowFailure extends IEvaluateFailure {
	kind: EvaluateFailureKind.DID_THROW;
	error: Error;
}

export interface IEvaluateIsAsyncFailure extends IEvaluateFailure {
	kind: EvaluateFailureKind.IS_ASYNC;
}

export interface IEvaluateNondeterministicFailure extends IEvaluateFailure {
	kind: EvaluateFailureKind.NONDETERMINISTIC;
}

export type EvaluateFailure = IEvaluateMaxOpsExceededFailure|IEvaluateIsAsyncFailure|IEvaluateNondeterministicFailure|IEvaluateDidThrowFailure;