import test from "ava";
import {withTypeScript, withTypeScriptVersions} from "./util/ts-macro";
import {generateRollupBundle} from "./setup/setup-rollup";
import {formatCode} from "./util/format-code";

test("Will treat every file as a module with tslib. #1", withTypeScriptVersions(">=3.6"), async (t, {typescript}) => {
	const bundle = await generateRollupBundle(
		[
			{
				entry: true,
				fileName: "index.ts",
				text: `\
						(async () => {})();
					`
			}
		],
		{
			typescript,
			rollupOptions: {
				external: ["tslib"]
			},

			tsconfig: {
				target: "es3",
				lib: ["esnext"]
			}
		}
	);
	const {
		bundle: {
			output: [file]
		}
	} = bundle;

	t.deepEqual(
		formatCode(file.code),
		formatCode(`\
				import { __awaiter, __generator } from 'tslib';

				(function () { return __awaiter(void 0, void 0, void 0, function () { return __generator(this, function (_a) {
						return [2 /*return*/];
				}); }); })();
			`)
	);
});

test("Will use the proper @babel/runtime/helpers/esm helpers when format is ESM. #1", withTypeScript, async (t, {typescript}) => {
	const bundle = await generateRollupBundle(
		[
			{
				entry: true,
				fileName: "index.ts",
				text: `\
						(async () => {})();
					`
			}
		],
		{
			typescript,
			transpiler: "babel",
			rollupOptions: {
				external: fileName => fileName.includes("@babel")
			},

			tsconfig: {
				target: "es3"
			}
		}
	);
	const {
		bundle: {
			output: [file]
		}
	} = bundle;

	t.deepEqual(
		formatCode(file.code),
		formatCode(`\
		import _asyncToGenerator from '@babel/runtime/helpers/esm/asyncToGenerator';
		import _regeneratorRuntime from '@babel/runtime/regenerator';
		
		_asyncToGenerator(
		/*#__PURE__*/ _regeneratorRuntime.mark(function _callee() {
			return _regeneratorRuntime.wrap(function _callee$(_context) {
				while (1) {
					switch (_context.prev = _context.next) {
						case 0:
						case "end":
							return _context.stop();
					}
				}
			}, _callee);
		}))();
			`)
	);
});

test("Will use the proper @babel/runtime/helpers/esm helpers when format is ESM. #3", withTypeScript, async (t, {typescript}) => {
	const bundle = await generateRollupBundle(
		[
      {
        entry: false,
        fileName: `node_modules/@babel/runtime/package.json`,
        text: `
          {
            "name": "${module}",
            "version": "1.0.0",
            "types": "index.d.ts"
          }
        `
      },
      {
        entry: false,
        fileName: `node_modules/@babel/runtime/helpers/esm/possibleConstructorReturn.js`,
        text: `
          import _typeof from "@babel/runtime/helpers/typeof";
          import assertThisInitialized from "./assertThisInitialized.js";
          export default function _possibleConstructorReturn(self, call) {
            if (call && (_typeof(call) === "object" || typeof call === "function")) {
              return call;
            } else if (call !== void 0) {
              throw new TypeError("Derived constructors may only return object or undefined");
            }
          
            return assertThisInitialized(self);
          }
        `
      },
			{
				entry: true,
				fileName: "index.ts",
				text: `\
        class ObjX extends Object {}

					`
			}
		],
		{
			typescript,
			transpiler: "babel",
			rollupOptions: {
				external: fileName => fileName.includes("@babel") && fileName.includes("typeof")
			},

			tsconfig: {
				target: "es3"
			}
		}
	);
	const {
		bundle: {
			output: [file]
		}
	} = bundle;

	t.deepEqual(
		formatCode(file.code),
		formatCode(`\
    import '@babel/runtime/helpers/esm/classCallCheck';
    import '@babel/runtime/helpers/esm/inherits';
    import '@babel/runtime/helpers/esm/typeof';
    import '@babel/runtime/helpers/esm/getPrototypeOf';
    import '@babel/runtime/helpers/esm/wrapNativeSuper';
			`)
	);
});

test("Will use the proper @babel/runtime/helpers helpers when format is CJS. #1", withTypeScript, async (t, {typescript}) => {
	const bundle = await generateRollupBundle(
		[
			{
				entry: true,
				fileName: "index.ts",
				text: `\
						(async () => {})();
					`
			}
		],
		{
			typescript,
			transpiler: "babel",
			format: "cjs",
			rollupOptions: {
				external: fileName => fileName.includes("@babel")
			},

			tsconfig: {
				target: "es3"
			}
		}
	);
	const {
		bundle: {
			output: [file]
		}
	} = bundle;

	t.deepEqual(
		formatCode(file.code),
		formatCode(`\
		'use strict';

		var _asyncToGenerator = require('@babel/runtime/helpers/asyncToGenerator');
		var _regeneratorRuntime = require('@babel/runtime/regenerator');
		
		function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }
		
		var _asyncToGenerator__default = /*#__PURE__*/_interopDefaultLegacy(_asyncToGenerator);
		var _regeneratorRuntime__default = /*#__PURE__*/_interopDefaultLegacy(_regeneratorRuntime);
		
		_asyncToGenerator__default['default']( /*#__PURE__*/_regeneratorRuntime__default['default'].mark(function _callee() {
			return _regeneratorRuntime__default['default'].wrap(function _callee$(_context) {
				while (1) {
					switch (_context.prev = _context.next) {
						case 0:
						case "end":
							return _context.stop();
					}
				}
			}, _callee);
		}))();
			`)
	);
});
