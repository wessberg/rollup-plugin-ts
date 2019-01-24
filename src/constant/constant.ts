export const SOURCE_MAP_EXTENSION = ".map";
export const TS_EXTENSION = ".ts";
export const TSX_EXTENSION = ".tsx";
export const JS_EXTENSION = ".js";
export const JSX_EXTENSION = ".jsx";
export const JSON_EXTENSION = ".json";
export const MJS_EXTENSION = ".mjs";
export const MJSX_EXTENSION = ".mjsx";
export const DECLARATION_EXTENSION = `.d${TS_EXTENSION}`;
export const DECLARATION_MAP_EXTENSION = `.d${TS_EXTENSION}${SOURCE_MAP_EXTENSION}`;
export const SOURCE_MAP_COMMENT = "\n//# sourceMappingURL";
export const SOURCE_MAP_COMMENT_REGEXP = /\n\/\/# sourceMappingURL=.*/g;
export const TSLIB_NAME = `tslib${DECLARATION_EXTENSION}`;
export const REGENERATOR_RUNTIME_NAME_1 = `@babel/runtime/regenerator/index.js`;
export const REGENERATOR_RUNTIME_NAME_2 = `babel-runtime/regenerator/index.js`;
export const TYPEOF_BABEL_HELPER_NAME_1 = `@babel/runtime/helpers/esm/typeof.js`;
export const TYPEOF_BABEL_HELPER_NAME_2 = `@babel/runtime/helpers/typeof.js`;
export const TYPEOF_BABEL_HELPER_NAME_3 = `babel-runtime/helpers/esm/typeof.js`;
export const TYPEOF_BABEL_HELPER_NAME_4 = `babel-runtime/helpers/typeof.js`;

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

export const FORCED_BABEL_OPTIONS = {
	modules: false
};

export const MAIN_FIELDS = ["module", "es2015", "esm2015", "jsnext:main", "main"];

export const MAIN_FIELDS_BROWSER = ["browser", "module", "es2015", "esm2015", "jsnext:main", "main"];

export const DEFAULT_LIB_NAMES: Set<string> = new Set([
	"lib.d.ts",
	"lib.dom.d.ts",
	"lib.dom.iterable.d.ts",
	"lib.es5.d.ts",
	"lib.es6.d.ts",
	"lib.es2015.collection.d.ts",
	"lib.es2015.core.d.ts",
	"lib.es2015.d.ts",
	"lib.es2015.generator.d.ts",
	"lib.es2015.iterable.d.ts",
	"lib.es2015.promise.d.ts",
	"lib.es2015.proxy.d.ts",
	"lib.es2015.reflect.d.ts",
	"lib.es2015.symbol.d.ts",
	`lib.es2015.symbol.wellknown.d.ts`,
	"lib.es2016.array.include.d.ts",
	"lib.es2016.d.ts",
	"lib.es2016.full.d.ts",
	"lib.es2017.d.ts",
	"lib.es2017.full.d.ts",
	"lib.es2017.intl.d.ts",
	"lib.es2017.object.d.ts",
	"lib.es2017.sharedmemory.d.ts",
	"lib.es2017.string.d.ts",
	"lib.es2017.typedarrays.d.ts",
	"lib.es2018.d.ts",
	"lib.es2018.full.d.ts",
	"lib.es2018.intl.d.ts",
	"lib.es2018.promise.d.ts",
	"lib.es2018.regexp.d.ts",
	"lib.esnext.array.d.ts",
	"lib.esnext.asynciterable.d.ts",
	"lib.esnext.d.ts",
	"lib.esnext.bigint.d.ts",
	"lib.esnext.full.d.ts",
	"lib.esnext.intl.d.ts",
	"lib.esnext.symbol.d.ts",
	"lib.scripthost.d.ts",
	"lib.webworker.d.ts",
	"lib.webworker.importscripts.d.ts"
]);

export const DEBUG = process.env.ROLLUP_PLUGIN_TS_DEBUG === "true" || process.env.ROLLUP_PLUGIN_TS_DEBUG === "" || process.env.ROLLUP_PLUGIN_TS_DEBUG === "1";
