import test from "ava";
import {withTypeScript} from "./util/ts-macro";
import {generateRollupBundle} from "./setup/setup-rollup";
import {formatCode} from "./util/format-code";

test.serial("Can use swc for transpilation. #1", withTypeScript, async (t, {typescript}) => {
	const bundle = await generateRollupBundle(
		[
			{
				entry: true,
				fileName: "index.ts",
				text: `\
					typeof "";
					`
			}
		],
		{
			typescript,
			transpiler: "swc",
			loadSwcHelpers: true,
			rollupOptions: {
				external: ["@swc/helpers"]
			},
			exclude: [],
			tsconfig: {
				target: "es5",
				allowJs: true
			}
		}
	);
	const {
		js: [file]
	} = bundle;

	t.deepEqual(
		formatCode(file.code),
		formatCode(`\
		import * as swcHelpers from '@swc/helpers';

		swcHelpers.typeOf("");
		`)
	);
});

test.serial("Can use swc for transpilation. #2", withTypeScript, async (t, {typescript}) => {
	const bundle = await generateRollupBundle(
		[
			{
				entry: true,
				fileName: "index.ts",
				text: `\
					class Foo {
						protected method (): void {
							console.log("called!");
						}
					}

					export class Bar extends Foo {
						constructor () {
							super();
							this.method();
						}
					} {

					}
					`
			}
		],
		{
			typescript,
			transpiler: "swc",
			rollupOptions: {
				external: ["@swc/helpers"]
			},
			exclude: [],
			tsconfig: {
				target: "es5",
				allowJs: true
			}
		}
	);
	const {
		js: [file]
	} = bundle;

	t.deepEqual(
		formatCode(file.code),
		formatCode(`\
		import * as swcHelpers from '@swc/helpers';

		var Foo = /*#__PURE__*/ function() {
			function Foo() {
				swcHelpers.classCallCheck(this, Foo);
			}
			swcHelpers.createClass(Foo, [
				{
					key: "method",
					value: function method() {
						console.log("called!");
					}
				}
			]);
			return Foo;
		}();
		var Bar = /*#__PURE__*/ function(Foo) {
			swcHelpers.inherits(Bar, Foo);
			var _super = swcHelpers.createSuper(Bar);
			function Bar() {
				swcHelpers.classCallCheck(this, Bar);
				var _this;
				_this = _super.call(this);
				_this.method();
				return _this;
			}
			return Bar;
		}(Foo);

		export { Bar };
		`)
	);
});

test.serial("Can use swc without externalHelpers", withTypeScript, async (t, {typescript}) => {
	const bundle = await generateRollupBundle(
		[
			{
				entry: true,
				fileName: "index.ts",
				text: `\
					typeof "";
					`
			}
		],
		{
			typescript,
			transpiler: "swc",
			loadSwcHelpers: true,
			swcConfig: {
				jsc: {
					externalHelpers: false,
				}
			},
			exclude: [],
			tsconfig: {
				target: "es5",
				allowJs: true
			}
		}
	);
	const {
		js: [file]
	} = bundle;

	t.deepEqual(
		formatCode(file.code),
		formatCode(`\
		var _typeof = function(obj) {
			return obj && typeof Symbol !== "undefined" && obj.constructor === Symbol ? "symbol" : typeof obj;
		};
		_typeof("");
		`)
	);
});

test.serial("Supports swc minification. #1", withTypeScript, async (t, {typescript}) => {
	const bundle = await generateRollupBundle(
		[
			{
				entry: true,
				fileName: "index.ts",
				text: `\
					import {bar} from "./bar";
					export const foo = 2 + 4 === 4 ? console.log("foo") : console.log("bar");

					console.log(
						bar.toUpperCase()
					);
					`
			},
			{
				entry: false,
				fileName: "bar.ts",
				text: `\
					export const bar = (
						"foo" +
						"bar"
					);
					`
			}
		],
		{
			typescript,
			transpiler: "swc",
			exclude: [],
			swcConfig: {
				minify: true
			},
			tsconfig: {
				target: "es5",
				allowJs: true
			}
		}
	);
	const {
		js: [file]
	} = bundle;

	t.deepEqual(
		formatCode(file.code),
		formatCode(`\
		var bar="foo"+"bar";var foo=console.log("bar");console.log(bar.toUpperCase());export{foo}
		`)
	);
});
