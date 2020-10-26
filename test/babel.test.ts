import test from "./util/test-runner";
import {ConfigItem} from "@babel/core";
import {generateRollupBundle} from "./setup/setup-rollup";
import {BABEL_CONFIG_JS_FILENAME, BABEL_CONFIG_JSON_FILENAME, BABELRC_FILENAME} from "../src/constant/constant";
import {createTemporaryFile} from "./util/create-temporary-file";
import {normalize} from "../src/util/path/path-util";
import {getAppropriateEcmaVersionForBrowserslist} from "@wessberg/browserslist-generator";

test("Doesn't break when combining @babel/preset-env with the useBuiltins: 'usage' option. #1", async (t, {typescript}) => {
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
			typescript,
			transpiler: "babel",
			exclude: [],
			tsconfig: {
				target: "es5",
				allowJs: true
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

test("Can resolve the nearest project-wide babel config. #1", async (t, {typescript}) => {
	const unlinker = createTemporaryFile(BABEL_CONFIG_JS_FILENAME, `exports = {}`);
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
				typescript,
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

test("Can resolve the nearest project-wide babel config. #2", async (t, {typescript}) => {
	const unlinker = createTemporaryFile(BABEL_CONFIG_JSON_FILENAME, `{}`, "json");
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
				typescript,
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

test("Can resolve a babel config file by file path. #1", async (t, {typescript}) => {
	const unlinker = createTemporaryFile(BABEL_CONFIG_JSON_FILENAME, `{}`, "json");
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
				typescript,
				transpiler: "babel",
				babelConfig: unlinker.path,
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

test("Can find a babel config with rootMode: 'upward'. #1", async (t, {typescript}) => {
	const unlinker = createTemporaryFile(BABEL_CONFIG_JSON_FILENAME, `{}`, "json");
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
				typescript,
				transpiler: "babel",
				cwd: unlinker.dir,
				babelConfig: {
					rootMode: "upward"
				},
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

test("Can resolve the nearest file-relative babel config. #1", async (t, {typescript}) => {
	const unlinker = createTemporaryFile(BABELRC_FILENAME, `{}`, "json");
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
				typescript,
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
		t.true(configFileName != null);
		t.deepEqual(normalize(configFileName!), normalize(unlinker.path));
	}
});

test("Won't apply @babel/preset-env if the browserslist option is 'false'. #1", async (t, {typescript}) => {
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
			typescript,
			transpiler: "babel",
			browserslist: false,
			hook: {
				babelConfig: (config, _, phase) => {
					if (phase === "chunk") return config;
					hasPresetEnv =
						config != null &&
						(config.presets ?? []).length > 0 &&
						((config.presets as ConfigItem[]) ?? []).some(preset => preset.file != null && preset.file.resolved.includes("preset-env"));
					return config;
				}
			}
		}
	);
	t.true(hasPresetEnv === false);
});

test("Will apply @babel/preset-env if a Browserslist is provided or discovered. #1", async (t, {typescript}) => {
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
			typescript,
			transpiler: "babel",
			browserslist: ["> 3%"],
			hook: {
				babelConfig: (config, _, phase) => {
					if (phase === "chunk") return config;
					hasPresetEnv =
						config != null &&
						(config.presets ?? []).length > 0 &&
						((config.presets as ConfigItem[]) ?? []).some(preset => preset.file != null && preset.file.resolved.includes("preset-env"));
					return config;
				}
			}
		}
	);
	t.true(hasPresetEnv === true);
});

test("Will auto-generate a Browserslist based on the 'target' from the tsconfig if none is discovered and babel is used as transpiler. #1", async (t, {typescript}) => {
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
			typescript,
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
							: (config.presets as ConfigItem[]).find(preset => preset.file != null && preset.file.resolved.includes("preset-env"));
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

test("Will apply minification-related plugins only in the renderChunk phase. #1", async (t, {typescript}) => {
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
			typescript,
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
