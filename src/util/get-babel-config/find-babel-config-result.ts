import {IBabelInputOptions} from "../../plugin/i-babel-options";

export interface FindBabelConfigResultBase {
	kind: "project" | "relative" | "dict";
}

export interface FindBabelConfigDictResult extends FindBabelConfigResultBase {
	kind: "dict";
	options: Partial<IBabelInputOptions>;
}

export interface FindBabelConfigProjectResult extends FindBabelConfigResultBase {
	kind: "project";
	path: string;
}

export interface FindBabelConfigRelativeResult extends FindBabelConfigResultBase {
	kind: "relative";
	path: string;
}

export type FindBabelConfigResult = FindBabelConfigDictResult | FindBabelConfigProjectResult | FindBabelConfigRelativeResult;
