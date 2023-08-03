import {test} from "./util/test-runner.js";
import {generateRollupBundle} from "./setup/setup-rollup.js";
import {formatCode} from "./util/format-code.js";
import path from "crosspath";

test.serial("Can use swc for transpilation. #1", "*", async (t, {typescript, rollup}) => {
	const bundle = await generateRollupBundle(
		[
			{
				entry: true,
				fileName: "index.ts",
				text: `\
					typeof "";
					const foo = [...[]];
					`
			}
		],
		{
			typescript,
			rollup,
			transpiler: "swc",
			loadSwcHelpers: true,
			rollupOptions: {
				external: p => !path.normalize(p).endsWith(`index.ts`)
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
		import { _ as _$1 } from '@swc/helpers/_/_to_consumable_array';
		import { _ } from '@swc/helpers/_/_type_of';

		_("");
		_$1([]);
		`)
	);
});

test.serial("Can use swc for transpilation. #2", "*", async (t, {typescript, rollup}) => {
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
			rollup,
			transpiler: "swc",
			rollupOptions: {
				external: p => !path.normalize(p).endsWith(`index.ts`)
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
		import { _ as _$2 } from '@swc/helpers/_/_class_call_check';
		import { _ as _$3 } from '@swc/helpers/_/_create_class';
		import { _ } from '@swc/helpers/_/_inherits';
		import { _ as _$1 } from '@swc/helpers/_/_create_super';

		var Foo = /*#__PURE__*/ function() {
			function Foo() {
				_$2(this, Foo);
			}
			_$3(Foo, [
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
			_(Bar, Foo);
			var _super = _$1(Bar);
			function Bar() {
				_$2(this, Bar);
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

test.serial("Can use swc for transpilation. #3", "*", async (t, {typescript, rollup}) => {
	const bundle = await generateRollupBundle(
		[
			{
				entry: true,
				fileName: "index.ts",
				text: `\
				const enum Animals {
					Fish
				}
				console.log(Animals.Fish);
					`
			}
		],
		{
			typescript,
			rollup,
			transpiler: "swc"
		}
	);
	const {
		js: [file]
	} = bundle;

	t.deepEqual(
		formatCode(file.code),
		formatCode(`\
		var Animals;
		(function(Animals) {
			Animals[Animals["Fish"] = 0] = "Fish";
		})(Animals || (Animals = {}));
		console.log(0);
		`)
	);
});

test.serial("Can combine swc with the Typescript Compiler APIs for transpilation. #1", {ts: `>=4.7`}, async (t, {typescript, rollup}) => {
	const bundle = await generateRollupBundle(
		[
			{
				entry: true,
				fileName: "index.ts",
				text: `\
				const enum Animals {
					Fish
				}
				console.log(Animals.Fish);
				export const foo: string = "Hello, World!";
					`
			}
		],
		{
			typescript,
			rollup,
			transpiler: {
				typescriptSyntax: "typescript",
				otherSyntax: "swc"
			}
		}
	);
	const {
		js: [file]
	} = bundle;

	t.deepEqual(
		formatCode(file.code),
		formatCode(`\
		console.log(0 /* Animals.Fish */ );
		const foo = "Hello, World!";

		export { foo };
		`)
	);
});

test.serial("Can combine swc with the Typescript Compiler APIs for transpilation. #2", {ts: `<4.7`}, async (t, {typescript, rollup}) => {
	const bundle = await generateRollupBundle(
		[
			{
				entry: true,
				fileName: "index.ts",
				text: `\
				const enum Animals {
					Fish
				}
				console.log(Animals.Fish);
				export const foo: string = "Hello, World!";
					`
			}
		],
		{
			typescript,
			rollup,
			transpiler: {
				typescriptSyntax: "typescript",
				otherSyntax: "swc"
			}
		}
	);
	const {
		js: [file]
	} = bundle;

	t.deepEqual(
		formatCode(file.code),
		formatCode(`\
		console.log(0 /* Fish */ );
		const foo = "Hello, World!";

		export { foo };
		`)
	);
});

test.serial("Can combine swc with the Typescript Compiler APIs for transpilation. #3", {ts: `>=4.7`}, async (t, {typescript, rollup}) => {
	const bundle = await generateRollupBundle(
		[
			{
				entry: true,
				fileName: "index.ts",
				text: `\
				const enum Animals {
					Fish
				}
				console.log(Animals.Fish);
				export const foo: string = "Hello, World!";
					`
			}
		],
		{
			typescript,
			rollup,
			tsconfig: {
				target: "es5"
			},
			transpiler: {
				typescriptSyntax: "typescript",
				otherSyntax: "swc"
			}
		}
	);
	const {
		js: [file]
	} = bundle;

	t.deepEqual(
		formatCode(file.code),
		formatCode(`\
		console.log(0 /* Animals.Fish */ );
		var foo = "Hello, World!";

		export { foo };
		`)
	);
});

test.serial("Can combine swc with the Typescript Compiler APIs for transpilation. #4", {ts: `<4.7`}, async (t, {typescript, rollup}) => {
	const bundle = await generateRollupBundle(
		[
			{
				entry: true,
				fileName: "index.ts",
				text: `\
				const enum Animals {
					Fish
				}
				console.log(Animals.Fish);
				export const foo: string = "Hello, World!";
					`
			}
		],
		{
			typescript,
			rollup,
			tsconfig: {
				target: "es5"
			},
			transpiler: {
				typescriptSyntax: "typescript",
				otherSyntax: "swc"
			}
		}
	);
	const {
		js: [file]
	} = bundle;

	t.deepEqual(
		formatCode(file.code),
		formatCode(`\
		console.log(0 /* Fish */ );
		var foo = "Hello, World!";

		export { foo };
		`)
	);
});

test.serial("Can combine swc with the Typescript Compiler APIs for transpilation. #5", {ts: `<4.7`}, async (t, {typescript, rollup}) => {
	const bundle = await generateRollupBundle(
		[
			{
				entry: true,
				fileName: "index.ts",
				text: `\
				const enum Animals {
					Fish
				}
				console.log(Animals.Fish);
				export const foo: string = "Hello, World!";
					`
			}
		],
		{
			typescript,
			rollup,
			tsconfig: {
				target: "esnext"
			},
			swcConfig: {
				jsc: {
					parser: {
						target: "es5"
					}
				}
			},
			transpiler: {
				typescriptSyntax: "typescript",
				otherSyntax: "swc"
			}
		}
	);
	const {
		js: [file]
	} = bundle;

	t.deepEqual(
		formatCode(file.code),
		formatCode(`\
		console.log(0 /* Fish */);
		const foo = "Hello, World!";

		export { foo };
		`)
	);
});

test.serial("Can combine swc with the Typescript Compiler APIs for transpilation. #6", {ts: `>=4.7`}, async (t, {typescript, rollup}) => {
	const bundle = await generateRollupBundle(
		[
			{
				entry: true,
				fileName: "index.ts",
				text: `\
				const enum Animals {
					Fish
				}
				console.log(Animals.Fish);
				export const foo: string = "Hello, World!";
					`
			}
		],
		{
			typescript,
			rollup,
			tsconfig: {
				target: "esnext"
			},
			swcConfig: {
				jsc: {
					parser: {
						target: "es5"
					}
				}
			},
			transpiler: {
				typescriptSyntax: "typescript",
				otherSyntax: "swc"
			}
		}
	);
	const {
		js: [file]
	} = bundle;

	t.deepEqual(
		formatCode(file.code),
		formatCode(`\
		console.log(0 /* Animals.Fish */ );
		const foo = "Hello, World!";

		export { foo };
		`)
	);
});

test.serial("Supports swc minification. #1", "*", async (t, {typescript, rollup}) => {
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
			rollup,
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

test.serial("Supports multiple swc configurations. #1", "*", async (t, {typescript, rollup}) => {
	const bundle = await generateRollupBundle(
		[
			{
				entry: true,
				fileName: "foo.ts",
				text: `\
				export const foo: number = 2;
					`
			},
			{
				entry: true,
				fileName: "bar.js",
				text: `\

				export const bar = 2;
					`
			}
		],
		{
			typescript,
			rollup,
			transpiler: "swc",
			swcConfig: [
				{
					test: ".ts$",
					jsc: {
						parser: {
							syntax: "typescript"
						}
					},
					env: {
						targets: {
							chrome: "100"
						}
					}
				},
				{
					test: ".js$",
					jsc: {
						parser: {
							syntax: "ecmascript"
						}
					},
					env: {
						targets: {
							ie: "11"
						}
					}
				}
			]
		}
	);
	const {
		js: [fileA, fileB]
	} = bundle;

	t.deepEqual(
		formatCode(fileA.code),
		formatCode(`\
		const foo = 2;

		export { foo };
		`)
	);

	t.deepEqual(
		formatCode(fileB.code),
		formatCode(`\
		var bar = 2;

		export { bar };
		`)
	);
});
