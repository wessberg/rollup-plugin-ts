import type {TS} from "../../src/type/ts.js";
import type {InputCompilerOptions, TypescriptPluginOptions} from "../../src/plugin/typescript-plugin-options.js";
import path from "crosspath";
import type {PartialExcept} from "helpertypes";
import semver from "semver";
import {allowsNodeNextModuleResolution} from "../../src/util/module-resolution/module-resolution-util.js";

export interface TestContext {
	cwd: string;
	dist: string;
	transpileOnly: boolean;
	loadBabelHelpers: boolean;
	loadSwcHelpers: boolean;
	typescript: typeof TS;
	debug: TypescriptPluginOptions["debug"];
	hook: TypescriptPluginOptions["hook"];
	transpiler: TypescriptPluginOptions["transpiler"];
	exclude: TypescriptPluginOptions["exclude"];
	include: TypescriptPluginOptions["include"];
	tsconfig: Partial<InputCompilerOptions> | string;
}

export function createTestContext({
	debug = process.env.DEBUG === "true",
	typescript,
	cwd = process.cwd(),
	dist = cwd,
	hook = {outputPath: p => p},
	transpileOnly = false,
	transpiler = "typescript",
	loadBabelHelpers = false,
	loadSwcHelpers = false,
	tsconfig = {},
	exclude = [],
	include = []
}: PartialExcept<TestContext, "typescript">): TestContext {
	if (!path.isAbsolute(cwd)) {
		cwd = path.join(process.cwd(), cwd);
	}
	let baseUrl = path.relative(cwd, ".");
	if (baseUrl === "") baseUrl = ".";

	return {
		debug,
		typescript,
		cwd,
		dist,
		loadBabelHelpers,
		loadSwcHelpers,
		hook,
		transpileOnly,
		transpiler,
		exclude,
		include,
		tsconfig:
			typeof tsconfig === "string"
				? path.isAbsolute(tsconfig)
					? tsconfig
					: path.join(cwd, tsconfig)
				: {
						target: "esnext",
						declaration: true,
						moduleResolution:
							typescript.ModuleResolutionKind.NodeNext != null && allowsNodeNextModuleResolution(typescript)
								? "nodenext"
								: typescript.ModuleResolutionKind.Node16 != null
								? "node16"
								: typescript.ModuleResolutionKind.Node10 != null
								? "node10"
								: "node",

						...(semver.satisfies(typescript.version, ">= 5.0", {includePrerelease: true})
							? {
									// Deprecations will cause crashes on TypeScript v5.0 and forward
									ignoreDeprecations: "5.0"
							  }
							: {}),
						baseUrl,
						...tsconfig
				  }
	};
}
