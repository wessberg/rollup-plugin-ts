import {Options} from "@swc/core";
import path from "crosspath";
import {FORCED_SWC_JSC_OPTIONS, FORCED_SWC_MODULE_OPTIONS} from "../constant/constant";
import {SwcConfigHook, TranspilationPhase, TypescriptPluginSwcOptions} from "../plugin/typescript-plugin-options";
import {SwcConfig} from "../type/swc";
import {TS} from "../type/ts";

export interface GetSwcConfigOptions {
	cwd: string;
	fileSystem: TS.System;
	swcConfig: TypescriptPluginSwcOptions["swcConfig"];
	browserslist: string[] | undefined;
	phase: TranspilationPhase;
	hook: SwcConfigHook | undefined;
}

export type SwcConfigFactory = (filename: string) => Options | undefined;

function readConfig(config: TypescriptPluginSwcOptions["swcConfig"], cwd: string, fileSystem: TS.System): SwcConfig {
	if (config == null) {
		const absoluteConfig = path.normalize(path.join(cwd, `.swcrc`));
		if (!fileSystem.fileExists(absoluteConfig)) {
			return {};
		}
		return JSON.parse(fileSystem.readFile(absoluteConfig)!);
	} else if (typeof config === "string") {
		const absoluteConfig = path.normalize(path.isAbsolute(config) ? config : path.join(cwd, config));
		if (!fileSystem.fileExists(absoluteConfig)) {
			throw new ReferenceError(`Could not find swc config at path: ${config}`);
		}
		return JSON.parse(fileSystem.readFile(absoluteConfig)!);
	} else {
		return config;
	}
}

/**
 * Gets a Swc Config based on the given options
 */
export function getSwcConfigFactory({fileSystem, swcConfig, cwd, browserslist, phase, hook}: GetSwcConfigOptions): SwcConfigFactory {
	const inputConfig = readConfig(swcConfig, cwd, fileSystem);

	return filename => {
		// Never allow minifying outside of the 'chunk' phase
		const minify = phase === "file" ? false : Boolean(inputConfig.minify);

		// There's really no point to running jsc in the chunk phase if no minification should be applied
		if (phase === "chunk" && !minify) {
			return undefined;
		}

		const config: Options = {
			...inputConfig,

			module: {
				...inputConfig.module,
				...FORCED_SWC_MODULE_OPTIONS
			},
			jsc: {
				// Loose breaks things such as spreading an iterable that isn't an array
				loose: false,
				...inputConfig.jsc,
				parser: {
					syntax: "ecmascript",
					...(inputConfig.jsc?.parser?.syntax === "typescript" ? {} : {jsx: false}),
					...inputConfig.jsc?.parser
				},
				...FORCED_SWC_JSC_OPTIONS
			},
			env: {
				// Use swc's env option that behaves like @babel/preset-env when a Browserslist has been given
				...(browserslist == null
					? inputConfig.env
					: {
							// Loose breaks things such as spreading an iterable that isn't an array
							loose: false,
							shippedProposals: true,
							targets: browserslist,
							...inputConfig.env
					  })
			},
			cwd,
			filename,
			minify,
			swcrc: false,
			configFile: false,
			root: cwd,
			// Always produce sourcemaps. Rollup will be the decider of what to do with them.
			sourceMaps: true,
			// Always use the cwd provided to the plugin

			// Never let swc be the decider of which files to ignore. Rather let Rollup decide that
			exclude: undefined,
			// Never let swc be the decider of which files to include. Rather let Rollup decide that
			test: undefined,

			// Always parse things as modules. Rollup will then decide what to do based on the output format
			isModule: true
		};
		return hook?.(config, filename, phase) ?? config;
	};
}
