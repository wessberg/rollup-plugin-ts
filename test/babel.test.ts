import test from "ava";
import {ConfigItem} from "@babel/core";
import {generateRollupBundle} from "./setup/setup-rollup";
import {BABEL_CONFIG_JS_FILENAME, BABEL_CONFIG_JSON_FILENAME, BABELRC_FILENAME} from "../src/constant/constant";
import {createTemporaryConfigFile} from "./util/create-temporary-config-file";
import {normalize} from "../src/util/path/path-util";
import {getAppropriateEcmaVersionForBrowserslist} from "@wessberg/browserslist-generator";

test("Doesn't break when combining @babel/preset-env with the useBuiltins: 'usage' option. #1", async t => {
	const bundle = await generateRollupBundle(
		[
			{
				entry: true,
				fileName: "index.ts",
				text: `\
					console.log([].includes(2));
					`
			}
		],
		{
			debug: false,
			transpiler: "babel",
			exclude: [],
			tsconfig: {
				target: "es5"
			},
			babelConfig: {
				presets: [
					[
						"@babel/preset-env",
						{
							useBuiltIns: "usage",
							corejs: {version: 3, proposals: true}
						}
					]
				]
			}
		}
	);
	const {
		js: [file]
	} = bundle;
	t.true(file.code.includes(`addToUnscopables('includes')`));
});

test("Can resolve the nearest project-wide babel config. #1", async t => {
	const unlinker = createTemporaryConfigFile(BABEL_CONFIG_JS_FILENAME, `exports = {}`);
	let configFileName: string | undefined;
	try {
		await generateRollupBundle(
			[
				{
					entry: true,
					fileName: "index.ts",
					text: `\
					console.log([].includes(2));
					`
				}
			],
			{
				debug: false,
				cwd: unlinker.dir,
				transpiler: "babel",
				hook: {
					babelConfig: (config, fileName) => {
						configFileName = fileName;
						return config;
					}
				}
			}
		);
	} catch (ex) {
		t.fail(ex);
		throw ex;
	} finally {
		unlinker.cleanup();
		t.true(configFileName != null && normalize(configFileName) === normalize(unlinker.path));
	}
});

test("Can resolve the nearest project-wide babel config. #2", async t => {
	const unlinker = createTemporaryConfigFile(BABEL_CONFIG_JSON_FILENAME, `{}`, "json");
	let configFileName: string | undefined;
	try {
		await generateRollupBundle(
			[
				{
					entry: true,
					fileName: "index.ts",
					text: `\
					console.log([].includes(2));
					`
				}
			],
			{
				debug: false,
				cwd: unlinker.dir,
				transpiler: "babel",
				hook: {
					babelConfig: (config, fileName) => {
						configFileName = fileName;
						return config;
					}
				}
			}
		);
	} catch (ex) {
		t.fail(ex);
		throw ex;
	} finally {
		unlinker.cleanup();
		t.true(configFileName != null && normalize(configFileName) === normalize(unlinker.path));
	}
});

test("Can resolve the nearest file-relative babel config. #1", async t => {
	const unlinker = createTemporaryConfigFile(BABELRC_FILENAME, `{}`, "json");
	let configFileName: string | undefined;
	try {
		await generateRollupBundle(
			[
				{
					entry: true,
					fileName: "index.ts",
					text: `\
					console.log([].includes(2));
					`
				}
			],
			{
				debug: false,
				cwd: unlinker.dir,
				transpiler: "babel",
				hook: {
					babelConfig: (config, fileName) => {
						configFileName = fileName;
						return config;
					}
				}
			}
		);
	} catch (ex) {
		t.fail(ex);
		throw ex;
	} finally {
		unlinker.cleanup();
		t.true(configFileName != null && normalize(configFileName) === normalize(unlinker.path));
	}
});

test("Won't apply @babel/preset-env if the browserslist option is 'false'. #1", async t => {
	let hasPresetEnv: boolean | undefined;
	await generateRollupBundle(
		[
			{
				entry: true,
				fileName: "index.ts",
				text: `\
					console.log([].includes(2));
					`
			}
		],
		{
			debug: false,
			transpiler: "babel",
			browserslist: false,
			hook: {
				babelConfig: (config, _, phase) => {
					if (phase === "chunk") return config;
					hasPresetEnv =
						config != null &&
						(config.presets ?? []).length > 0 &&
						(config.presets ?? []).some((preset: ConfigItem) => preset.file != null && preset.file.resolved.includes("preset-env"));
					return config;
				}
			}
		}
	);
	t.true(hasPresetEnv === false);
});

test("Will apply @babel/preset-env if a Browserslist is provided or discovered. #1", async t => {
	let hasPresetEnv: boolean | undefined;
	await generateRollupBundle(
		[
			{
				entry: true,
				fileName: "index.ts",
				text: `\
					console.log([].includes(2));
					`
			}
		],
		{
			debug: false,
			transpiler: "babel",
			browserslist: ["> 3%"],
			hook: {
				babelConfig: (config, _, phase) => {
					if (phase === "chunk") return config;
					hasPresetEnv =
						config != null &&
						(config.presets ?? []).length > 0 &&
						(config.presets ?? []).some((preset: ConfigItem) => preset.file != null && preset.file.resolved.includes("preset-env"));
					return config;
				}
			}
		}
	);
	t.true(hasPresetEnv === true);
});

test("Will auto-generate a Browserslist based on the 'target' from the tsconfig if none is discovered and babel is used as transpiler. #1", async t => {
	let browserslist: string[] | undefined;
	await generateRollupBundle(
		[
			{
				entry: true,
				fileName: "index.ts",
				text: `\
					console.log([].includes(2));
					`
			}
		],
		{
			debug: false,
			transpiler: "babel",
			tsconfig: {
				target: "es2015"
			},
			hook: {
				babelConfig: (config, _, phase) => {
					if (phase === "chunk") return config;
					const matchingPreset =
						config == null || config.presets == null
							? undefined
							: config.presets.find((preset: ConfigItem) => preset.file != null && preset.file.resolved.includes("preset-env"));
					if (matchingPreset != null) {
						browserslist = (matchingPreset as {options: {targets: {browsers: string[]}}}).options.targets.browsers;
					}
					return config;
				}
			}
		}
	);

	t.true(browserslist != null && getAppropriateEcmaVersionForBrowserslist(browserslist) === "es2015");
});

test("Will apply minification-related plugins only in the renderChunk phase. #1", async t => {
	let isMinifiedInTransformPhase: boolean | undefined;
	let isMinifiedInChunkPhase: boolean | undefined;
	await generateRollupBundle(
		[
			{
				entry: true,
				fileName: "index.ts",
				text: `\
					class Mangler {
						private program?: object;

						constructor(program?: object) {
							this.program = program;
						}
					}
					console.log(new Mangler());
					`
			}
		],
		{
			debug: false,
			transpiler: "babel",
			browserslist: false,
			postPlugins: [
				{
					name: "plugin",
					transform(code) {
						isMinifiedInTransformPhase = !/\r?\n/.test(code);
						return null;
					},

					renderChunk(code) {
						isMinifiedInChunkPhase = !/\r?\n/.test(code);
						return null;
					}
				}
			],
			babelConfig: {
				presets: ["minify"]
			}
		}
	);

	t.false(isMinifiedInTransformPhase);
	t.true(isMinifiedInChunkPhase);
});
