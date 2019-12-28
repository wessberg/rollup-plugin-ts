import {InputOptions} from "rollup";

export const SOURCE_MAP_EXTENSION = ".map";
export const TS_EXTENSION = ".ts";
export const TSX_EXTENSION = ".tsx";
export const JS_EXTENSION = ".js";
export const JS_MAP_EXTENSION = `${JS_EXTENSION}${SOURCE_MAP_EXTENSION}`;
export const JSX_EXTENSION = ".jsx";
export const JSON_EXTENSION = ".json";
export const MJS_EXTENSION = ".mjs";
export const MJSX_EXTENSION = ".mjsx";
export const DECLARATION_EXTENSION = `.d${TS_EXTENSION}`;
export const DECLARATION_MAP_EXTENSION = `.d${TS_EXTENSION}${SOURCE_MAP_EXTENSION}`;

export const KNOWN_EXTENSIONS = new Set([
	DECLARATION_EXTENSION,
	DECLARATION_MAP_EXTENSION,
	JS_MAP_EXTENSION,
	TS_EXTENSION,
	TSX_EXTENSION,
	JS_EXTENSION,
	JSX_EXTENSION,
	JSON_EXTENSION,
	MJS_EXTENSION,
	MJSX_EXTENSION
] as const);

export const DEFAULT_TYPES_ROOT = "@types";
export const NODE_MODULES = "node_modules";
export const NODE_MODULES_MATCH_PATH = `/${NODE_MODULES}/`;
export const SOURCE_MAP_COMMENT = "//# sourceMappingURL";
export const TSLIB_NAME = `tslib${DECLARATION_EXTENSION}`;
export const BABEL_RUNTIME_PREFIX_1 = "@babel/runtime/";
export const BABEL_RUNTIME_PREFIX_2 = "babel-runtime/";
export const BABEL_CONFIG_JS_FILENAME = "babel.config.js";

export const REGENERATOR_RUNTIME_NAME_1 = `${BABEL_RUNTIME_PREFIX_1}regenerator/index.js`;
export const REGENERATOR_RUNTIME_NAME_2 = `${BABEL_RUNTIME_PREFIX_2}regenerator/index.js`;
export const BABEL_EXAMPLE_HELPERS = [`${BABEL_RUNTIME_PREFIX_1}helpers/esm/typeof.js`, `${BABEL_RUNTIME_PREFIX_2}helpers/esm/typeof.js`];

export const BABEL_MINIFICATION_BLACKLIST_PRESET_NAMES = [];

export const BABEL_MINIFICATION_BLACKLIST_PLUGIN_NAMES = ["@babel/plugin-transform-runtime", "babel-plugin-transform-runtime"];

export const BABEL_MINIFY_PRESET_NAMES = ["babel-preset-minify"];

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

export const FORCED_BABEL_PRESET_ENV_OPTIONS = {
	modules: false
};

export const FORCED_BABEL_YEARLY_PRESET_OPTIONS = {
	...FORCED_BABEL_PRESET_ENV_OPTIONS
};

export const FORCED_BABEL_PLUGIN_TRANSFORM_RUNTIME_OPTIONS = (rollupInputOptions: InputOptions) => {
	let forceESModules: boolean = true;

	// Only apply the forceESModules option if @babel helpers aren't treated as external.
	if (
		BABEL_EXAMPLE_HELPERS.some(helper => {
			if (typeof rollupInputOptions.external === "function") {
				return rollupInputOptions.external(helper, "", true) === true;
			} else if (Array.isArray(rollupInputOptions.external)) {
				return rollupInputOptions.external.includes(helper);
			} else {
				return false;
			}
		})
	) {
		forceESModules = false;
	}

	return {
		helpers: true,
		regenerator: true,
		...(forceESModules ? {useESModules: true} : {})
	};
};

export const ROLLUP_PLUGIN_MULTI_ENTRY = "\0rollup-plugin-multi-entry:entry-point";
