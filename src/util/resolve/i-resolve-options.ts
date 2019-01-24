export interface IResolveBaseOptions {
	id: string;
	parent: string;
}

export interface IResolveOptions extends IResolveBaseOptions {
	mainFields?: string[];
	extensions?: string[];
}
