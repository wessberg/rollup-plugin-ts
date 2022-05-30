import {Babel} from "../type/babel.js";
import {Swc} from "../type/swc.js";
import {listFormat} from "./list-format.js";

/**
 * The babel module is optionally imported on-demand as needed
 */
let babelModule: typeof Babel | undefined;

/**
 * The swc module is optionally imported on-demand as needed
 */
let swcModule: typeof Swc | undefined;

export async function loadBabel(): Promise<typeof Babel> {
	return (babelModule ??= await loadModules("babel", "@babel/core", ["@babel/runtime", "@babel/plugin-transform-runtime", "@babel/preset-env"]));
}

export async function loadSwc(): Promise<typeof Swc> {
	return (swcModule ??= await loadModules("swc", "@swc/core", ["@swc/helpers"]));
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function loadModules<TCoreModule extends string, TSubModules extends string[]>(context: string, coreModule: TCoreModule, subModules?: TSubModules): Promise<any> {
	const moduleNames = [coreModule, ...(subModules ?? [])] as const;

	// We could be using Promise.allSettled here, but since we still allow Node v10 we'll have to shim it here.
	// Once we move up to Node v12.9 or newer, we can replace this with simply Promise.allSettled
	const results = await Promise.all(
		moduleNames
			.map(async moduleName => import(moduleName))
			.map(async promise =>
				promise
					.then(
						value =>
							({
								status: "fulfilled",
								value
							} as const)
					)
					.catch(
						reason =>
							({
								status: "rejected",
								reason
							} as const)
					)
			)
	);

	const [core] = results;

	const rejectedModuleNames = moduleNames.filter((moduleName, index) => {
		const result = results[index];
		if (result.status === "fulfilled") return false;
		if (!(result.reason instanceof Error)) return true;

		return (
			"code" in result.reason &&
			"message" in result.reason &&
			(result.reason as {code: string}).code === "MODULE_NOT_FOUND" &&
			(result.reason as {message: string}).message.includes(moduleName)
		);
	});

	if (core.status === "rejected" || rejectedModuleNames.length > 0) {
		const formattedRejectedModuleNames = listFormat(rejectedModuleNames, "and", rejectedModuleName => `"${rejectedModuleName}"`);

		throw new ReferenceError(
			`The following ${context} ${
				rejectedModuleNames.length === 1 ? "dependency" : "dependencies"
			} could not be found within your node_modules folder: ${formattedRejectedModuleNames}. Make sure to install ${
				rejectedModuleNames.length === 1 ? "it" : "them"
			} if you want to use ${context} for transpilation`
		);
	}

	// At this point, the core module will always be defined
	return core.value;
}
