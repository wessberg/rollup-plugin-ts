// tslint:disable:no-any

export interface IBabelConfigItem {
	value: Function;
	options?: {[key: string]: unknown};
	dirname: string;
	name?: string;
	file: {
		request: string;
		resolved: string;
	};
}

export interface IBabelInputOptions {
	presets: {}[];
	plugins: {}[];
	retainLines: boolean;
	compact: boolean | "auto";
	minified: boolean;
	auxiliaryCommentBefore: string;
	auxiliaryCommentAfter: string;
	comments: boolean;
	shouldPrintComment(value: string): boolean;
}

export interface IBabelConfig extends Partial<IBabelInputOptions> {
	cwd: string;
	root: string;
	presets: any[];
	plugins: any[];
	sourceMaps?: boolean;
	sourceMap?: boolean;
	include?: any;
	exclude?: any;
	ignore?: any;
	only?: any;
	sourceType: "script" | "module" | "unambiguous";
}
