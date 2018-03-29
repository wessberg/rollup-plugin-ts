export interface ITypescriptPluginOptions {
	root: string;
	tsconfig: string;
	noEmit: boolean;
	include: string|string[];
	exclude: string|string[];
}