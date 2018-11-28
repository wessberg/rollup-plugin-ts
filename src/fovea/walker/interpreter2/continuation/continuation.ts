import {Literal} from "../literal/literal";

export const enum ContinuationFlag {
	BREAK,
	CONTINUE
}

export type Continuation<T = Literal> = (literal: T, flag?: ContinuationFlag) => void;