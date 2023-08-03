import {test} from "./util/test-runner.js";
import {formatCode} from "./util/format-code.js";
import {generateRollupBundle} from "./setup/setup-rollup.js";
import {createExternalTestFiles} from "./setup/test-file.js";

test.serial("Flattens declarations. #1", "*", async (t, {typescript, rollup}) => {
	const bundle = await generateRollupBundle(
		[
			{
				entry: true,
				fileName: "index.ts",
				text: `\
					import {Bar} from "./bar";
					export interface Foo extends Bar {}
					
					const foo = new Promise<void>(resolve => resolve());
					`
			},
			{
				entry: false,
				fileName: "bar.ts",
				text: `\
					export interface Bar {
						a: string;
					}
					`
			}
		],
		{
			typescript,
			rollup,
			debug: false
		}
	);
	const {
		declarations: [file]
	} = bundle;
	t.deepEqual(
		formatCode(file.code),
		formatCode(`\
		interface Bar {
			a: string;
		}
		interface Foo extends Bar {}
		export {Foo};
		`)
	);
});

test.serial("Flattens declarations. #2", "*", async (t, {typescript, rollup}) => {
	const bundle = await generateRollupBundle(
		[
			{
				entry: true,
				fileName: "index.ts",
				text: `\
					export * from "./bar";
					`
			},
			{
				entry: false,
				fileName: "bar.ts",
				text: `\
					export interface Foo {}
					`
			}
		],
		{
			typescript,
			rollup,
			debug: false
		}
	);
	const {
		declarations: [file]
	} = bundle;
	t.deepEqual(
		formatCode(file.code),
		formatCode(`\
		interface Foo {}
		export {Foo};
		`)
	);
});

test.serial("Flattens declarations. #3", "*", async (t, {typescript, rollup}) => {
	const bundle = await generateRollupBundle(
		[
			{
				entry: true,
				fileName: "index.ts",
				text: `\
					export * from "./bar";
					`
			},
			{
				entry: false,
				fileName: "bar.ts",
				text: `\
					export * from "./baz";
					`
			},
			{
				entry: false,
				fileName: "baz.ts",
				text: `\
					export interface Foo {}
					`
			}
		],
		{typescript, rollup, debug: false}
	);
	const {
		declarations: [file]
	} = bundle;

	t.deepEqual(
		formatCode(file.code),
		formatCode(`\
		interface Foo {}
		export {Foo};
		`)
	);
});

test.serial("Flattens declarations. #4", "*", async (t, {typescript, rollup}) => {
	const bundle = await generateRollupBundle(
		[
			{
				entry: true,
				fileName: "index.ts",
				text: `\
					export * from "./bar";
					`
			},
			{
				entry: false,
				fileName: "bar.ts",
				text: `\
					export * from "./a";
					export * from "./b";
					`
			},
			{
				entry: false,
				fileName: "a.ts",
				text: `\
					export type Something =
					| "foo"
					| "bar";
					`
			},
			{
				entry: false,
				fileName: "b.ts",
				text: `\
					export const enum SomethingElse {
						FOO = 0,
						BAR = 1
					}
					`
			}
		],
		{typescript, rollup, debug: false}
	);
	const {
		declarations: [file]
	} = bundle;

	t.deepEqual(
		formatCode(file.code),
		formatCode(`\
		type Something = "foo" | "bar";
		declare const enum SomethingElse {
			FOO = 0,
			BAR = 1
		}
		export {Something, SomethingElse};
		`)
	);
});

test.serial("Flattens declarations. #5", "*", async (t, {typescript, rollup}) => {
	const bundle = await generateRollupBundle(
		[
			{
				entry: true,
				fileName: "index.ts",
				text: `\
					import * as m from "./bar";
					export { m };
					`
			},
			{
				entry: false,
				fileName: "bar.ts",
				text: `\
					export const ten = 10;
					`
			}
		],
		{typescript, rollup, debug: false}
	);
	const {
		declarations: [file]
	} = bundle;

	t.deepEqual(
		formatCode(file.code),
		formatCode(`\
		declare namespace m {
    	const ten = 10;
		}
		export { m };
		`)
	);
});

test.serial("Flattens declarations. #6", "*", async (t, {typescript, rollup}) => {
	const bundle = await generateRollupBundle(
		[
			{
				entry: true,
				fileName: "index.ts",
				text: `\
          		export * from "./foo";
        	`
			},
			{
				entry: false,
				fileName: "foo/index.ts",
				text: `\
				export const Foo = "foo";
				`
			}
		],
		{
			typescript,
			rollup,
			debug: false
		}
	);
	const {
		declarations: [file]
	} = bundle;
	t.deepEqual(
		formatCode(file.code),
		formatCode(`\
			declare const Foo = "foo";
			export {Foo};
		`)
	);
});

test.serial("Flattens declarations. #7", "*", async (t, {typescript, rollup}) => {
	const bundle = await generateRollupBundle(
		[
			{
				entry: true,
				fileName: "index.ts",
				text: `\
          		export * from "./foo.baz";
          		export * from "./bar.baz";
        	`
			},
			{
				entry: false,
				fileName: "foo.baz.ts",
				text: `\
				export const Foo = "foo";
				`
			},
			{
				entry: false,
				fileName: "bar.baz.ts",
				text: `\
				export const Bar = "bar";
				`
			}
		],
		{
			typescript,
			rollup,
			debug: false
		}
	);
	const {
		declarations: [file]
	} = bundle;

	t.deepEqual(
		formatCode(file.code),
		formatCode(`\
			declare const Foo = "foo";
			declare const Bar = "bar";
			export {Foo, Bar};
		`)
	);
});

test.serial("Flattens declarations. #8", "*", async (t, {typescript, rollup}) => {
	const bundle = await generateRollupBundle(
		[
			{
				entry: true,
				fileName: "index.ts",
				text: `\
							import {Foo} from "./foo";
          		export const foo: Foo = 2;
        	`
			},
			{
				entry: false,
				fileName: "foo.ts",
				text: `\
				export type Foo = number;
				`
			}
		],
		{
			typescript,
			rollup,
			debug: false
		}
	);
	const {
		declarations: [file]
	} = bundle;

	t.deepEqual(
		formatCode(file.code),
		formatCode(`\
			type Foo = number;
			declare const foo: Foo;
			export {foo};
		`)
	);
});

test.serial("Flattens declarations. #9", "*", async (t, {typescript, rollup}) => {
	const bundle = await generateRollupBundle(
		[
			{
				entry: true,
				fileName: "index.ts",
				text: `\
        import * as bar from './bar';
        export type FooType = bar.BarType;
			`
			},
			{
				entry: false,
				fileName: "bar.ts",
				text: `\
        export type BarType = 'a' | 'b' | 'c';
			`
			}
		],
		{typescript, rollup, debug: false}
	);
	const {
		declarations: [file]
	} = bundle;

	t.deepEqual(
		formatCode(file.code),
		formatCode(`\
			declare namespace bar {
					type BarType = 'a' | 'b' | 'c';
			}
			type FooType = bar.BarType;
			export { FooType };
		`)
	);
});

test.serial("Flattens declarations. #10", "*", async (t, {typescript, rollup}) => {
	const bundle = await generateRollupBundle(
		[
			{
				entry: true,
				fileName: "index.ts",
				text: `\
        import { Item } from './items';
				export class B {
					items: Item[];
				}
			`
			},
			{
				entry: false,
				fileName: "items/item.ts",
				text: `\
        export interface Item {
					id: string;
				}
			`
			},
			{
				entry: false,
				fileName: "items/index.ts",
				text: `\
        export * from "./item";
			`
			}
		],
		{typescript, rollup, debug: false}
	);
	const {
		declarations: [file]
	} = bundle;

	t.deepEqual(
		formatCode(file.code),
		formatCode(`\
			interface Item {
					id: string;
			}
			declare class B {
					items: Item[];
			}
			export { B };
		`)
	);
});

test.serial("Flattens declarations. #11", "*", async (t, {typescript, rollup}) => {
	const bundle = await generateRollupBundle(
		[
			{
				entry: true,
				fileName: "index.ts",
				text: `\
        import {X} from "./x"
				export const y = new X
			`
			},
			{
				entry: false,
				fileName: "x.ts",
				text: `\
        declare class X {}
				export {X}
			`
			}
		],
		{
			typescript,
			rollup,
			debug: false,
			rollupOptions: {
				external(id) {
					return /\bx\b/.test(id);
				}
			}
		}
	);
	const {
		declarations: [file]
	} = bundle;

	t.deepEqual(
		formatCode(file.code),
		formatCode(`\
		import { X } from "./x";
		declare const y: X;
		export { y };

		`)
	);
});

test.serial("Flattens declarations. #12", "*", async (t, {typescript, rollup}) => {
	const bundle = await generateRollupBundle(
		[
			{
				entry: true,
				fileName: "index.ts",
				text: `\
        export {Foo} from "./foo"
			`
			},
			{
				entry: false,
				fileName: "foo.ts",
				text: `\
        export class Foo { static m() { return 1 } }
			`
			}
		],
		{
			typescript,
			rollup,
			debug: false
		}
	);
	const {
		declarations: [file]
	} = bundle;

	t.deepEqual(
		formatCode(file.code),
		formatCode(`\
			declare class Foo {
				static m(): number;
			}
			export {Foo};
		`)
	);
});

test.serial("Flattens declarations. #13", "*", async (t, {typescript, rollup}) => {
	const bundle = await generateRollupBundle(
		[
			{
				entry: true,
				fileName: "index.ts",
				text: `\
        import { A as AClass } from './a';
				export type A = AClass;
			`
			},
			{
				entry: false,
				fileName: "a.ts",
				text: `\
        export class A {}
			`
			}
		],
		{
			typescript,
			rollup,
			debug: false
		}
	);
	const {
		declarations: [file]
	} = bundle;

	t.deepEqual(
		formatCode(file.code),
		formatCode(`\
			declare class A {
			}
			declare module AWrapper {
					export { A };
			}
			import AClass = AWrapper.A;
			type A$0 = AClass;
			export { A$0 as A };
		`)
	);
});

test.serial("Flattens declarations. #14", {ts: ">=3.5"}, async (t, {typescript, rollup}) => {
	const bundle = await generateRollupBundle(
		[
			{
				entry: true,
				fileName: "src/components/generated.ts",
				text: `\
        export const WebGLMultisampleRenderTarget = {} as unknown as import("..").Overwrite<Partial<string>, number>;
				console.log(WebGLMultisampleRenderTarget);
			`
			},
			{
				entry: false,
				fileName: "src/index.ts",
				text: `\
        export type NonFunctionKeys<T> = {
						[K in keyof T]: T[K] extends Function ? never : K;
				}[keyof T];
				export type Overwrite<T, O> = Omit<T, NonFunctionKeys<O>> & O;
			`
			}
		],
		{
			typescript,
			rollup,
			debug: false
		}
	);
	const {
		declarations: [file]
	} = bundle;

	t.deepEqual(
		formatCode(file.code),
		formatCode(`\
		type NonFunctionKeys<T> = {
				[K in keyof T]: T[K] extends Function ? never : K;
		}[keyof T];
		type Overwrite<T, O> = Omit<T, NonFunctionKeys<O>> & O;
		declare const WebGLMultisampleRenderTarget: Overwrite<string, number>;
		export { WebGLMultisampleRenderTarget };
		`)
	);
});

test.serial("Flattens declarations. #15", {ts: ">=3.5"}, async (t, {typescript, rollup}) => {
	const bundle = await generateRollupBundle(
		[
			...createExternalTestFiles(
				"my-library",
				`export interface Foo<T> {
					bar: T;
				}`
			),
			{
				entry: true,
				fileName: "src/components/generated.ts",
				text: `\
        export const WebGLMultisampleRenderTarget = {} as unknown as import("my-library").Foo<import("..").Overwrite<Partial<string>, number>>;
				console.log(WebGLMultisampleRenderTarget);
			`
			},
			{
				entry: false,
				fileName: "src/index.ts",
				text: `\
        export type NonFunctionKeys<T> = {
						[K in keyof T]: T[K] extends Function ? never : K;
				}[keyof T];
				export type Overwrite<T, O> = Omit<T, NonFunctionKeys<O>> & O;
			`
			}
		],
		{
			typescript,
			rollup,
			debug: false
		}
	);
	const {
		declarations: [file]
	} = bundle;

	t.deepEqual(
		formatCode(file.code),
		formatCode(`\
		type NonFunctionKeys<T> = {
				[K in keyof T]: T[K] extends Function ? never : K;
		}[keyof T];
		type Overwrite<T, O> = Omit<T, NonFunctionKeys<O>> & O;
		declare const WebGLMultisampleRenderTarget: import("my-library").Foo<Overwrite<string, number>>;
		export { WebGLMultisampleRenderTarget };
		`)
	);
});

test.serial("Flattens declarations. #16", "*", async (t, {typescript, rollup}) => {
	const bundle = await generateRollupBundle(
		[
			{
				entry: true,
				fileName: "src/index.ts",
				text: `\
        import * as OtherModule from "./foo";

				export interface Problem {
					foo: OtherModule.F;
				}
			`
			},
			{
				entry: false,
				fileName: "src/foo.ts",
				text: `\
        export {Foo as F} from './bar';
			`
			},
			{
				entry: false,
				fileName: "src/bar.ts",
				text: `\
				export class Foo {}
			`
			}
		],
		{
			typescript,
			rollup,
			debug: false
		}
	);
	const {
		declarations: [file]
	} = bundle;

	t.deepEqual(
		formatCode(file.code),
		formatCode(`\
			declare namespace OtherModule {
				class Foo {
				}
				export { Foo as F };
			}
			interface Problem {
					foo: OtherModule.F;
			}
			export { Problem };
		`)
	);
});

test.serial("Flattens declarations. #17", "*", async (t, {typescript, rollup}) => {
	const bundle = await generateRollupBundle(
		[
			{
				entry: true,
				fileName: "index.ts",
				text: `\
					export class Singleton {
						private constructor() {}
					}
					`
			}
		],
		{
			typescript,
			rollup,
			debug: false
		}
	);
	const {
		declarations: [file]
	} = bundle;
	t.deepEqual(
		formatCode(file.code),
		formatCode(`\
		declare class Singleton {
			private constructor();
		}
		export {Singleton};
		`)
	);
});

test.serial("Flattens declarations. #18", "*", async (t, {typescript, rollup}) => {
	const bundle = await generateRollupBundle(
		[
			{
				entry: true,
				fileName: "foo.ts",
				text: `\
					export type foo = typeof import("./bar");
					`
			},
			{
				entry: false,
				fileName: "bar.ts",
				text: `\
					export type bar = number;
					`
			}
		],
		{
			typescript,
			rollup,
			debug: false
		}
	);
	const {
		declarations: [file]
	} = bundle;

	t.deepEqual(
		formatCode(file.code),
		formatCode(`\
			declare namespace barNS {
					type bar = number;
			}
			type foo = typeof barNS;
			export { foo };
		`)
	);
});

test.serial("Flattens declarations. #19", {ts: ">=4.1"}, async (t, {typescript, rollup}) => {
	const bundle = await generateRollupBundle(
		[
			{
				entry: true,
				fileName: "src/index.ts",
				text: `\
        type World = "hello";
        export type HelloWorld = \`hello \${World}\`;`
			}
		],
		{
			typescript,
			rollup,
			debug: false
		}
	);
	const {
		declarations: [file]
	} = bundle;

	t.deepEqual(
		formatCode(file.code),
		formatCode(`\
type World = "hello";
type HelloWorld = \`hello \${World}\`;
export { HelloWorld };
`)
	);
});

test.serial("Flattens declarations. #20", "*", async (t, {typescript, rollup}) => {
	const bundle = await generateRollupBundle(
		[
			{
				entry: true,
				fileName: "src/index.ts",
				text: `export * from "./foo";`
			},
			{
				entry: false,
				fileName: "src/foo.ts",
				text: `export type Foo = "bar"[]`
			}
		],
		{
			typescript,
			rollup,
			debug: false
		}
	);
	const {
		declarations: [file]
	} = bundle;

	t.deepEqual(
		formatCode(file.code),
		formatCode(`
		type Foo = "bar"[];
		export { Foo };`)
	);
});

test.serial("Flattens declarations. #21", "*", async (t, {typescript, rollup}) => {
	const bundle = await generateRollupBundle(
		[
			{
				entry: true,
				fileName: "src/index.ts",
				text: `export * from "./foo";`
			},
			{
				entry: false,
				fileName: "src/foo.ts",
				text: `\
				export interface Foo {
					path: (string | [string, string])[]
				}`
			}
		],
		{
			typescript,
			rollup,
			debug: false
		}
	);
	const {
		declarations: [file]
	} = bundle;

	t.deepEqual(
		formatCode(file.code),
		formatCode(`
		interface Foo {
			path: (string | [string, string])[];
		}
		export { Foo };
		`)
	);
});
