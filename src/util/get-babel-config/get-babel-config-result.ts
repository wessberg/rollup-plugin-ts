import {IBabelConfig} from "../../plugin/i-babel-options";

export interface GetBabelConfigResult {
	config(filename: string): IBabelConfig;
	chunkConfig: ((filename: string) => IBabelConfig) | undefined;
	hasChunkOptions: boolean;
}
