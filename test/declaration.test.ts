import test from "ava";
import {withTypeScript, withTypeScriptVersions} from "./util/ts-macro";
import {formatCode} from "./util/format-code";
import {generateRollupBundle} from "./setup/setup-rollup";
import {createExternalTestFiles} from "./setup/test-file";

test.serial("Flattens declarations. #1", withTypeScript, async (t, {typescript}) => {
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

test.serial("Flattens declarations. #2", withTypeScript, async (t, {typescript}) => {
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

test.serial("Flattens declarations. #3", withTypeScript, async (t, {typescript}) => {
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
		{typescript, debug: false}
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

test.serial("Flattens declarations. #4", withTypeScript, async (t, {typescript}) => {
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
		{typescript, debug: false}
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

test.serial("Flattens declarations. #5", withTypeScript, async (t, {typescript}) => {
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
		{typescript, debug: false}
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

test.serial("Flattens declarations. #6", withTypeScript, async (t, {typescript}) => {
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

test.serial("Flattens declarations. #7", withTypeScript, async (t, {typescript}) => {
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

test.serial("Flattens declarations. #8", withTypeScript, async (t, {typescript}) => {
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

test.serial("Flattens declarations. #9", withTypeScript, async (t, {typescript}) => {
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
		{typescript, debug: false}
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

test.serial("Flattens declarations. #10", withTypeScript, async (t, {typescript}) => {
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
		{typescript, debug: false}
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

test.serial("Flattens declarations. #11", withTypeScript, async (t, {typescript}) => {
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

test.serial("Flattens declarations. #12", withTypeScript, async (t, {typescript}) => {
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

test.serial("Flattens declarations. #13", withTypeScript, async (t, {typescript}) => {
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

test.serial("Flattens declarations. #14", withTypeScriptVersions(">=3.5"), async (t, {typescript}) => {
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

test.serial("Flattens declarations. #15", withTypeScriptVersions(">=3.5"), async (t, {typescript}) => {
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

test("Flattens declarations. #16", withTypeScript, async (t, {typescript}) => {
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

test.serial("Flattens declarations. #17", withTypeScript, async (t, {typescript}) => {
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

test.serial("Flattens declarations. #18", withTypeScript, async (t, {typescript}) => {
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

test.serial("Flattens declarations. #19", withTypeScriptVersions(">=4.1"), async (t, {typescript}) => {
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

test.serial("Flattens declarations. #20", withTypeScript, async (t, {typescript}) => {
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
