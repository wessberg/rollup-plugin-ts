import type {ElementOf} from "helpertypes";

export const SOURCE_MAP_EXTENSION = ".map";
export const TS_EXTENSION = ".ts";
export const TSX_EXTENSION = ".tsx";
export const MTS_EXTENSION = ".mts";
export const MTSX_EXTENSION = ".mtsx";
export const CTS_EXTENSION = ".cts";
export const CTSX_EXTENSION = ".ctsx";
export const JS_EXTENSION = ".js";
export const JS_MAP_EXTENSION = `.js.map`;
export const JSX_EXTENSION = ".jsx";
export const JSON_EXTENSION = ".json";

export const MJS_EXTENSION = ".mjs";
export const MJS_MAP_EXTENSION = ".mjs.map";
export const MJSX_EXTENSION = ".mjsx";
export const MJSX_MAP_EXTENSION = ".mjsx.map";

export const CJS_EXTENSION = ".cjs";
export const CJS_MAP_EXTENSION = ".cjs.map";
export const CJSX_EXTENSION = ".cjsx";
export const CJSX_MAP_EXTENSION = ".cjsx.map";

export const D_TS_EXTENSION = `.d.ts`;
export const D_TS_MAP_EXTENSION = `.d.ts.map`;

export const D_CTS_EXTENSION = `.d.cts`;
export const D_CTS_MAP_EXTENSION = `.d.cts.map`;

export const D_MTS_EXTENSION = `.d.mts`;
export const D_MTS_MAP_EXTENSION = `.d.mts.map`;

export const TSBUILDINFO_EXTENSION = `.tsbuildinfo`;

export const ROLLUP_PLUGIN_MULTI_ENTRY_LEGACY = "\0rollup-plugin-multi-entry:entry-point";
export const ROLLUP_PLUGIN_VIRTUAL_PREFIX = `\0virtual:`;

export const AMBIENT_EXTENSIONS = new Set([D_TS_EXTENSION, D_TS_MAP_EXTENSION, D_MTS_EXTENSION, D_MTS_MAP_EXTENSION, D_CTS_EXTENSION, D_CTS_MAP_EXTENSION] as const);

export type AmbientExtension = ElementOf<typeof AMBIENT_EXTENSIONS>;

export const KNOWN_EXTENSIONS = new Set([
	...AMBIENT_EXTENSIONS,
	JS_MAP_EXTENSION,
	TS_EXTENSION,
	MTS_EXTENSION,
	MTSX_EXTENSION,
	CTS_EXTENSION,
	CTSX_EXTENSION,
	TSX_EXTENSION,
	JS_EXTENSION,
	JSX_EXTENSION,
	JSON_EXTENSION,
	MJS_EXTENSION,
	MJS_MAP_EXTENSION,
	MJSX_EXTENSION,
	MJSX_MAP_EXTENSION,
	CJS_EXTENSION,
	CJS_MAP_EXTENSION,
	CJSX_EXTENSION,
	CJSX_MAP_EXTENSION,
	TSBUILDINFO_EXTENSION
] as const);

export type KnownExtension = ElementOf<typeof KNOWN_EXTENSIONS>;

export const DEFAULT_TSCONFIG_FILE_NAME = "tsconfig.json";
export const NODE_MODULES = "node_modules";
export const NODE_MODULES_MATCH_PATH = `/${NODE_MODULES}/`;
export const SOURCE_MAP_COMMENT = "//# sourceMappingURL";
export const SOURCE_MAP_COMMENT_REGEXP = /\/\/# sourceMappingURL=(\S*)/;
export const TSLIB_NAME = `tslib${D_TS_EXTENSION}`;
export const BABEL_RUNTIME_PREFIX_1 = "@babel/runtime/";
export const BABEL_RUNTIME_PREFIX_2 = "babel-runtime/";
export const SWC_HELPERS_PREFIX = "@swc/helpers";

export const BABEL_CONFIG_JS_FILENAME = "babel.config.js";
export const BABEL_CONFIG_MJS_FILENAME = "babel.config.mjs";
export const BABEL_CONFIG_JSON_FILENAME = "babel.config.json";
export const BABELRC_FILENAME = ".babelrc";

export const REGENERATOR_RUNTIME_NAME_1 = `${BABEL_RUNTIME_PREFIX_1}regenerator/index.js`;
export const REGENERATOR_RUNTIME_NAME_2 = `${BABEL_RUNTIME_PREFIX_2}regenerator/index.js`;
export const REGENERATOR_RUNTIME_NAME_3 = `regenerator-runtime/runtime.js`;
export const REGENERATOR_RUNTIME_VIRTUAL_SRC = `${ROLLUP_PLUGIN_VIRTUAL_PREFIX}regenerator-runtime`;
export const BABEL_REQUIRE_RUNTIME_HELPER_ESM_REGEXP_1 = new RegExp(`(require\\(["'\`])(${BABEL_RUNTIME_PREFIX_1}helpers/esm/[^"'\`]*)["'\`]\\)`);
export const BABEL_REQUIRE_RUNTIME_HELPER_ESM_REGEXP_2 = new RegExp(`(require\\(["'\`])(${BABEL_RUNTIME_PREFIX_2}helpers/esm/[^"'\`]*)["'\`]\\)`);
export const BABEL_IMPORT_RUNTIME_HELPER_CJS_REGEXP_1 = new RegExp(`(import\\s+\\w+\\s+from\\s+["'\`])(${BABEL_RUNTIME_PREFIX_1}helpers/[^"'/\`]*)["'\`]`);
export const BABEL_IMPORT_RUNTIME_HELPER_CJS_REGEXP_2 = new RegExp(`(import\\s+\\w+\\s+from\\s+["'\`])(${BABEL_RUNTIME_PREFIX_2}helpers/[^"'/\`]*)["'\`]`);
export const BABEL_IMPORT_RUNTIME_HELPER_CJS_REGEXP_3 = new RegExp(`(import\\s+["'\`])(${BABEL_RUNTIME_PREFIX_1}helpers/[^"'/\`]*)["'\`]`);
export const BABEL_IMPORT_RUNTIME_HELPER_CJS_REGEXP_4 = new RegExp(`(import\\s+["'\`])(${BABEL_RUNTIME_PREFIX_2}helpers/[^"'/\`]*)["'\`]`);

export const BABEL_MINIFICATION_BLACKLIST_PRESET_NAMES = [];

export const BABEL_MINIFICATION_BLACKLIST_PLUGIN_NAMES = ["@babel/plugin-transform-runtime", "babel-plugin-transform-runtime"];

export const BABEL_MINIFY_PRESET_NAMES = ["babel-preset-minify"];
export const BABEL_PRESET_TYPESCRIPT_NAMES = ["@babel/preset-typescript"];

export const BABEL_MINIFY_PLUGIN_NAMES = [
	"babel-plugin-transform-minify-booleans",
	"babel-plugin-minify-builtins",
	"babel-plugin-transform-inline-consecutive-adds",
	"babel-plugin-minify-dead-code-elimination",
	"babel-plugin-minify-constant-folding",
	"babel-plugin-minify-flip-comparisons",
	"babel-plugin-minify-guarded-expressions",
	"babel-plugin-minify-infinity",
	"babel-plugin-minify-mangle-names",
	"babel-plugin-transform-member-expression-literals",
	"babel-plugin-transform-merge-sibling-variables",
	"babel-plugin-minify-numeric-literals",
	"babel-plugin-transform-property-literals",
	"babel-plugin-transform-regexp-constructors",
	"babel-plugin-transform-remove-console",
	"babel-plugin-transform-remove-debugger",
	"babel-plugin-transform-remove-undefined",
	"babel-plugin-minify-replace",
	"babel-plugin-minify-simplify",
	"babel-plugin-transform-simplify-comparison-operators",
	"babel-plugin-minify-type-constructors",
	"babel-plugin-transform-undefined-to-void"
];

export const FORCED_SWC_MODULE_OPTIONS = {
	type: "es6"
} as const;

export const FORCED_SWC_JSC_OPTIONS = {
	externalHelpers: true
} as const;

export const FORCED_BABEL_PRESET_ENV_OPTIONS = {
	modules: false
} as const;

export const FORCED_BABEL_YEARLY_PRESET_OPTIONS = {
	...FORCED_BABEL_PRESET_ENV_OPTIONS
} as const;

export const FORCED_BABEL_PLUGIN_TRANSFORM_RUNTIME_OPTIONS = {
	helpers: true,
	regenerator: true,
	// eslint-disable-next-line @typescript-eslint/naming-convention
	useESModules: true
} as const;
