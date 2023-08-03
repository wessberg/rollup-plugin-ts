import {test} from "./util/test-runner.js";
import {formatCode} from "./util/format-code.js";
import {generateRollupBundle} from "./setup/setup-rollup.js";
import {createBuiltInModuleTestFiles, createExternalTestFiles} from "./setup/test-file.js";

test.serial("Deconflicts symbols. #1", "*", async (t, {typescript, rollup}) => {
	const bundle = await generateRollupBundle(
		[
			{
				entry: true,
				fileName: "index.ts",
				text: `\
					import {Foo as OtherFoo} from "./foo";
					export class Foo extends OtherFoo {}
					`
			},
			{
				entry: false,
				fileName: "foo.ts",
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
			declare class Foo {
			}
			declare module FooWrapper {
					export { Foo };
			}
			import OtherFoo = FooWrapper.Foo;
			declare class Foo$0 extends OtherFoo {
			}
			export { Foo$0 as Foo };
		`)
	);
});

test.serial("Deconflicts symbols. #2", "*", async (t, {typescript, rollup}) => {
	const bundle = await generateRollupBundle(
		[
			{
				entry: true,
				fileName: "index.ts",
				text: `\
					export {Foo} from "./foo";
					export {Bar} from "./bar";
					export type Baz = import("./foo").Foo;
					`
			},
			{
				entry: false,
				fileName: "foo.ts",
				text: `\
					export class Foo {}
					`
			},
			{
				entry: false,
				fileName: "bar.ts",
				text: `\
					export type Foo = number;
					export class Bar {
						someProp: Foo;
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
			declare class Foo {
			}
			type Foo$0 = number;
			declare class Bar {
					someProp: Foo$0;
			}
			type Baz = Foo;
			export { Foo, Bar, Baz };
		`)
	);
});

test.serial("Deconflicts symbols. #3", "*", async (t, {typescript, rollup}) => {
	const bundle = await generateRollupBundle(
		[
			{
				entry: true,
				fileName: "index.ts",
				text: `\
					export {A} from "./a";
					export {B} from "./b";
					`
			},
			{
				entry: false,
				fileName: "a.ts",
				text: `\
					import {B} from "./original";

					export interface A {
						b: B;
					}
					`
			},
			{
				entry: false,
				fileName: "b.ts",
				text: `\
					import {B as OriginalB} from "./original";

					export class B extends OriginalB {
						someOtherProp: string;
					}
					`
			},
			{
				entry: false,
				fileName: "original.ts",
				text: `\
					export class B {
						someOriginalProp: number;
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
			declare class B {
					someOriginalProp: number;
			}
			interface A {
					b: B;
			}
			declare module BWrapper {
					export { B };
			}
			import OriginalB = BWrapper.B;
			declare class B$0 extends OriginalB {
					someOtherProp: string;
			}
			export { A, B$0 as B };
		`)
	);
});

test.serial("Deconflicts symbols. #4", "*", async (t, {typescript, rollup}) => {
	const bundle = await generateRollupBundle(
		[
			{
				entry: true,
				fileName: "index.ts",
				text: `\
					export {A} from "./a";
					export {B} from "./b";
					`
			},
			{
				entry: false,
				fileName: "a.ts",
				text: `\
					import {B} from "./original";

					export const A: typeof B = 2;
					`
			},
			{
				entry: false,
				fileName: "b.ts",
				text: `\
					import {B as OriginalB} from "./original";

					export const B: typeof OriginalB = 2;
					`
			},
			{
				entry: false,
				fileName: "original.ts",
				text: `\
					export const B = 2;
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
			declare const B = 2;
			declare const A: typeof B;
			declare const OriginalB: typeof B;
			declare const B$0: typeof OriginalB;
			export { A, B$0 as B };
		`)
	);
});

test.serial("Deconflicts symbols. #5", "*", async (t, {typescript, rollup}) => {
	const bundle = await generateRollupBundle(
		[
			{
				entry: true,
				fileName: "index.ts",
				text: `\
					export * from "./a";
					export * from "./b";
					`
			},
			{
				entry: false,
				fileName: "a.ts",
				text: `\
					export class Foo {
						Bar: 2;
					}
					`
			},
			{
				entry: false,
				fileName: "b.ts",
				text: `\
					type Foo = number;
					export class Bar {
						Foo: Foo;
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
			declare class Foo {
				Bar: 2;
			}
			type Foo$0 = number;
			declare class Bar {
				Foo: Foo$0;
			}
			export { Foo, Bar };
		`)
	);
});

test.serial("Deconflicts symbols. #6", "*", async (t, {typescript, rollup}) => {
	const bundle = await generateRollupBundle(
		[
			{
				entry: true,
				fileName: "index.ts",
				text: `\
					export * from "./a";
					export * from "./b";
					`
			},
			{
				entry: false,
				fileName: "a.ts",
				text: `\
					export class Foo {
						Bar: 2;
					}
					`
			},
			{
				entry: false,
				fileName: "b.ts",
				text: `\
					type Foo = number;
					
					export class Bar {
						aMethod (Foo: Foo): void {
						}
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
			declare class Foo {
					Bar: 2;
			}
			type Foo$0 = number;
			declare class Bar {
					aMethod(Foo: Foo$0): void;
			}
			export { Foo, Bar };
		`)
	);
});

test.serial("Deconflicts symbols. #7", "*", async (t, {typescript, rollup}) => {
	const bundle = await generateRollupBundle(
		[
			{
				entry: true,
				fileName: "index.ts",
				text: `\
					export * from "./a";
					export * from "./b";
					`
			},
			{
				entry: false,
				fileName: "a.ts",
				text: `\
					export class Foo {
						Bar: 2;
					}
					`
			},
			{
				entry: false,
				fileName: "b.ts",
				text: `\
					const Foo = {Foo: "Foo"} as const;
					export type Baz = typeof Foo;
					export type Bar = {[Foo in "Foo"]: Baz[Foo]};
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
					Bar: 2;
			}
			declare const Foo$0: {
					readonly Foo: "Foo";
			};
			type Baz = typeof Foo$0;
			type Bar = {
					[Foo in "Foo"]: Baz[Foo];
			};
			export { Foo, Baz, Bar };
		`)
	);
});

test.serial("Deconflicts symbols. #8", "*", async (t, {typescript, rollup}) => {
	const bundle = await generateRollupBundle(
		[
			...createExternalTestFiles("my-library", `export type Foo = string;`),
			{
				entry: true,
				fileName: "index.ts",
				text: `\
					import {NS} from "./bar";
          export function foo<T extends NS.Foo> (): void {
          }
					`
			},
			{
				entry: false,
				fileName: "bar.ts",
				text: `\
          import * as NS from "my-library";
          export {NS};
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
		import * as NS from "my-library";
		declare function foo<T extends NS.Foo>(): void;
		export { foo };
		`)
	);
});

test.serial("Deconflicts symbols. #9", "*", async (t, {typescript, rollup}) => {
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
				fileName: "foo.ts",
				text: `\
					import {Bar} from "./bar";
					type Prop = string;
					export class Foo extends Bar {
						someProp: Prop;
					}
					`
			},
			{
				entry: false,
				fileName: "bar.ts",
				text: `\
					import {Baz} from "./baz";
					type Prop = string;
					export class Bar extends Baz {
						someOtherProp: Prop;
					}
					`
			},
			{
				entry: false,
				fileName: "baz.ts",
				text: `\
					type Prop = string;
					export class Baz {
						someOtherOtherProp: Prop;
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
		type Prop = string;
		declare class Baz {
				someOtherOtherProp: Prop;
		}
		type Prop$0 = string;
		declare class Bar extends Baz {
				someOtherProp: Prop$0;
		}
		type Prop$1 = string;
		declare class Foo extends Bar {
				someProp: Prop$1;
		}
		export { Foo };
		`)
	);
});

test.serial("Deconflicts symbols. #10", "*", async (t, {typescript, rollup}) => {
	const bundle = await generateRollupBundle(
		[
			{
				entry: true,
				fileName: "index.ts",
				text: `\
					export {Foo} from "./foo";
					export {Bar} from "./bar";
					export type Baz = typeof import("./foo");
					`
			},
			{
				entry: false,
				fileName: "foo.ts",
				text: `\
					export class Foo {}
					`
			},
			{
				entry: false,
				fileName: "bar.ts",
				text: `\
					export type Foo = number;
					export class Bar {
						someProp: Foo;
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
			declare class Foo {
			}
			type Foo$0 = number;
			declare class Bar {
					someProp: Foo$0;
			}
			declare namespace fooNS {
					class Foo {
					}
			}
			type Baz = typeof fooNS;
			export { Foo, Bar, Baz };
		`)
	);
});

test.serial("Deconflicts symbols. #11", "*", async (t, {typescript, rollup}) => {
	const bundle = await generateRollupBundle(
		[
			...createExternalTestFiles("my-library", `export declare class MyClass {}`),
			{
				entry: true,
				fileName: "index.ts",
				text: `\
					export {MyClass} from "./a";
					export {Bar} from "./b";
					`
			},
			{
				entry: false,
				fileName: "a.ts",
				text: `\
					import {MyClass as ExternalMyClass} from "my-library";

					export class MyClass implements ExternalMyClass {
						fileExists(_fileName: string): boolean {
							return true;
						}
						readFile(_fileName: string, _encoding?: string): string | undefined {
							return undefined;
						}
					}
					`
			},
			{
				entry: false,
				fileName: "b.ts",
				text: `\
					import {MyClass} from "my-library";

					export interface Bar {
						myClass: MyClass;
					};
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
			import { MyClass as ExternalMyClass } from "my-library";
			import { MyClass as MyClass$0 } from "my-library";
			declare class MyClass implements ExternalMyClass {
					fileExists(_fileName: string): boolean;
					readFile(_fileName: string, _encoding?: string): string | undefined;
			}
			interface Bar {
					myClass: MyClass$0;
			}
			export { MyClass, Bar };
		`)
	);
});

test.serial("Deconflicts symbols. #12", "*", async (t, {typescript, rollup}) => {
	const bundle = await generateRollupBundle(
		[
			...createExternalTestFiles("my-library", `export interface FooBarBaz {}`),
			{
				entry: true,
				fileName: "index.ts",
				text: `\
					import {FooBarBaz} from "my-library";
					export {Foo} from "./a";
					export interface Bar {
						fooBarBaz: FooBarBaz;
					}
					`
			},
			{
				entry: false,
				fileName: "a.ts",
				text: `\
					import {FooBarBaz} from "my-library";

					export interface Foo {
						fooBarBaz: FooBarBaz;
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
			import { FooBarBaz } from "my-library";
			interface Foo {
					fooBarBaz: FooBarBaz;
			}
			interface Bar {
					fooBarBaz: FooBarBaz;
			}
			export { Foo, Bar };
		`)
	);
});

test.serial("Deconflicts symbols. #13", "*", async (t, {typescript, rollup}) => {
	const bundle = await generateRollupBundle(
		[
			...createExternalTestFiles("my-library", `export declare class MyClass {}`),
			{
				entry: true,
				fileName: "index.ts",
				text: `\
					export * from "./a";
					`
			},
			{
				entry: false,
				fileName: "a.ts",
				text: `\
					export {MyClass} from "./b";
					export {Bar} from "./c";
			`
			},
			{
				entry: false,
				fileName: "b.ts",
				text: `\
					import {MyClass as ExternalMyClass} from "my-library";

					export class MyClass implements ExternalMyClass {
						fileExists(_fileName: string): boolean {
							return true;
						}
						readFile(_fileName: string, _encoding?: string): string | undefined {
							return undefined;
						}
					}
					`
			},
			{
				entry: false,
				fileName: "c.ts",
				text: `\
					import {MyClass} from "my-library";

					export interface Bar {
						myClass: MyClass;
					};
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
			import { MyClass as ExternalMyClass } from "my-library";
			import { MyClass as MyClass$0 } from "my-library";
			declare class MyClass implements ExternalMyClass {
					fileExists(_fileName: string): boolean;
					readFile(_fileName: string, _encoding?: string): string | undefined;
			}
			interface Bar {
					myClass: MyClass$0;
			}
			export { MyClass, Bar };
		`)
	);
});

test.serial("Deconflicts symbols. #14", "*", async (t, {typescript, rollup}) => {
	const bundle = await generateRollupBundle(
		[
			...createExternalTestFiles("my-library", `export type Foo = string;`),
			{
				entry: true,
				fileName: "index.ts",
				text: `\
        import {mlModule} from "./bar";
        import {IFoo} from "./baz";

        export class Foo extends IFoo {
        	readonly ml: typeof mlModule;
        }
			`
			},
			{
				entry: false,
				fileName: "bar.ts",
				text: `\
			import * as mlModuleType from "my-library";
			export const mlModule: { ml: typeof mlModuleType } = { ml: mlModuleType };
			`
			},
			{
				entry: false,
				fileName: "baz.ts",
				text: `\
			import * as mlModule from "my-library";
			export class IFoo {
				readonly otherMl: typeof mlModule;
			}
			`
			},
			{
				entry: false,
				fileName: "qux.ts",
				text: `\
			import * as mlModule from "my-library";
			export class IBar {
				readonly yetAnotherMl: typeof mlModule;
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
			import * as mlModuleType from "my-library";
			import * as mlModule$0 from "my-library";
			declare const mlModule: {
					ml: typeof mlModuleType;
			};
			declare class IFoo {
					readonly otherMl: typeof mlModule$0;
			}
			declare class Foo extends IFoo {
					readonly ml: typeof mlModule;
			}
			export { Foo };
		`)
	);
});

test.serial("Deconflicts symbols. #15", "*", async (t, {typescript, rollup}) => {
	const bundle = await generateRollupBundle(
		[
			{
				entry: true,
				fileName: "index.ts",
				text: `\
        export * from "./a";
        export * from "./b";
        export {foo as bar} from "./a";
			`
			},
			{
				entry: false,
				fileName: "a.ts",
				text: `\
			export function foo (): void {};
			`
			},
			{
				entry: false,
				fileName: "b.ts",
				text: `\
			const enum foo {
				FOO = "FOO"
			}
			
			export const baz: foo = foo.FOO;
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
			declare function foo(): void;
			declare const enum foo$0 {
					FOO = "FOO"
			}
			declare const baz: foo$0;
			export { foo, foo as bar, baz };
		`)
	);
});

test.serial("Deconflicts symbols. #16", "*", async (t, {typescript, rollup}) => {
	const bundle = await generateRollupBundle(
		[
			{
				entry: true,
				fileName: "index.ts",
				text: `\
        import Foo from "./a";
        export {Foo as Bar};
        export {default as Baz} from "./b";
			`
			},
			{
				entry: false,
				fileName: "a.ts",
				text: `\
			export default function foo (): void {}
			`
			},
			{
				entry: false,
				fileName: "b.ts",
				text: `\
			export default class Foo {}
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
			declare function foo(): void;
			declare const Foo: typeof foo;
			declare class Foo$0 {
			}
			export { Foo as Bar, Foo$0 as Baz };
		`)
	);
});

test.serial("Deconflicts symbols. #17", "*", async (t, {typescript, rollup}) => {
	const bundle = await generateRollupBundle(
		[
			{
				entry: true,
				fileName: "index.ts",
				text: `\
        import {default as bar} from "./a";
        type foo = typeof bar;
        export {foo as default};
			`
			},
			{
				entry: false,
				fileName: "a.ts",
				text: `\
			export default function foo (): void {}
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
			declare function foo(): void;
			declare const bar: typeof foo;
			type foo$0 = typeof bar;
			export { foo$0 as default };
		`)
	);
});

test.serial("Deconflicts symbols. #18", "*", async (t, {typescript, rollup}) => {
	const bundle = await generateRollupBundle(
		[
			{
				entry: true,
				fileName: "index.ts",
				text: `\
					import {Bar} from "./bar";
					export interface Foo extends Bar {}
					`
			},
			{
				entry: false,
				fileName: "bar.ts",
				text: `\
					interface Foo {
						a: string;
					}
					export interface Bar extends Foo {
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
		interface Foo {
			a: string;
		}
		interface Bar extends Foo {
		}
		interface Foo$0 extends Bar {
		}
		export {Foo$0 as Foo};
		`)
	);
});

test.serial("Deconflicts symbols. #19", "*", async (t, {typescript, rollup}) => {
	const bundle = await generateRollupBundle(
		[
			{
				entry: true,
				fileName: "a.ts",
				text: `\
					import { setInstance, S } from './b';
					export const f2 = {
  					[S]: ({ foo }: { foo: string }) =>
   						(foo + ": foo")
					};

					export const fns = {
						f1: setInstance,
						f2,
					};
					`
			},
			{
				entry: false,
				fileName: "b.ts",
				text: `\
					export const setFactory = <T>() => new Set<T>();
					export const setInstance = setFactory<number | boolean>();
					export const S = Symbol('foo');
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
		declare const S: unique symbol;
declare const f2: {
    [S]: ({ foo }: {
        foo: string;
    }) => string;
};
declare const fns: {
    f1: Set<number | boolean>;
    f2: {
        [S]: ({ foo }: {
            foo: string;
        }) => string;
    };
};
export { f2, fns };


		`)
	);
});

test.serial("Deconflicts symbols. #20", "*", async (t, {typescript, rollup}) => {
	const bundle = await generateRollupBundle(
		[
			{
				entry: true,
				fileName: "src/components/a.ts",
				text: `\
				export {Bar} from "./b";
        export const Foo = {} as unknown as import("..").Foo;
			`
			},
			{
				entry: false,
				fileName: "src/components/b.ts",
				text: `\
        type Foo = 2;
        export type Bar = Foo;
			`
			},
			{
				entry: true,
				fileName: "src/index.ts",
				text: `\
        export type Foo = {a: string; b: number};
			`
			}
		],
		{
			typescript,
			rollup,
			debug: false
		}
	);
	const {declarations} = bundle;

	const index = declarations.find(dec => dec.fileName.includes("index.d.ts"));
	const a = declarations.find(dec => dec.fileName.includes("a.d.ts"));
	t.true(index != null);
	t.true(a != null);

	t.deepEqual(
		formatCode(a!.code),
		formatCode(`\
		type Foo = 2;
		type Bar = Foo;
		declare const Foo$0: import("./index.js").Foo;
		export { Bar, Foo$0 as Foo };
		`)
	);

	t.deepEqual(
		formatCode(index!.code),
		formatCode(`\
		type Foo = {
			a: string;
			b: number;
		};
		export { Foo };
		`)
	);
});

test.serial("Deconflicts symbols. #21", {ts: ">=4.1"}, async (t, {typescript, rollup}) => {
	const bundle = await generateRollupBundle(
		[
			{
				entry: true,
				fileName: "index.ts",
				text: `\
					export * from "./foo";
					export * from "./bar";
					`
			},
			{
				entry: false,
				fileName: "foo.ts",
				text: `\
					type World = "hello";
					export type HelloWorld = \`hello \${World}\`;
					`
			},
			{
				entry: false,
				fileName: "bar.ts",
				text: `\
					type World = "hello";
					export type GoodbyeWorld = \`goodbye \${World}\`;
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
type World = "hello";
type HelloWorld = \`hello \${World}\`;
type World$0 = "hello";
type GoodbyeWorld = \`goodbye \${World$0}\`;
export { HelloWorld, GoodbyeWorld };`)
	);
});

test.serial("Deconflicts symbols. #22", "*", async (t, {typescript, rollup}) => {
	const bundle = await generateRollupBundle(
		[
			{
				entry: true,
				fileName: "src/index.ts",
				text: `\
				export { default as foo } from "./foo";
				export { default as bar } from "./bar";
			`
			},
			{
				entry: false,
				fileName: "src/foo.ts",
				text: `\
        interface Foo {
						<T, R>(value: T, fn: (value: T) => R): R;
				}
				
				const foo: Foo = (value: any, fn: any) => {
						return fn(value)
				}
				
				export default foo;
			`
			},
			{
				entry: false,
				fileName: "src/bar.ts",
				text: `\
        
				interface Bar {
						<T, R>(value: T, fn: (value: T) => R): R;
				}
				
				const bar: Bar = (value: any, fn: any) => {
						return fn(value)
				}
				
				export default bar;
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
		interface Foo {
				<T, R>(value: T, fn: (value: T) => R): R;
		}
		declare const foo: Foo;
		interface Bar {
				<T, R>(value: T, fn: (value: T) => R): R;
		}
		declare const bar: Bar;
		export { foo, bar };
		`)
	);
});

test.serial("Deconflicts symbols. #23", "*", async (t, {typescript, rollup}) => {
	const bundle = await generateRollupBundle(
		[
			{
				entry: true,
				fileName: "src/index.ts",
				text: `\
				import { B } from "./b";
				import { B as B2 } from "./b2";
				export { B, B2 };
			`
			},
			{
				entry: false,
				fileName: "src/b.ts",
				text: `\
        export class B { }
			`
			},
			{
				entry: false,
				fileName: "src/b2.ts",
				text: `\
				export class B { }
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
		declare class B {
		}
		declare class B$0 {
		}
		declare module BWrapper {
				export { B$0 as B };
		}
		import B2 = BWrapper.B;
		export { B, B2 };
		`)
	);
});

test.serial("Will merge declarations declared in same SourceFile rather than deconflict. #1", "*", async (t, {typescript, rollup}) => {
	const bundle = await generateRollupBundle(
		[
			{
				entry: true,
				fileName: "index.ts",
				text: `\
				export interface Something {
					type: string;
				}
				
				export namespace Something {
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
			interface Something {
				type: string;
			}	
			declare namespace Something {
			}
			export {Something};
		`)
	);
});

test.serial("Won't deconflict overloaded function signatures #1", "*", async (t, {typescript, rollup}) => {
	const bundle = await generateRollupBundle(
		[
			{
				entry: true,
				fileName: "index.ts",
				text: `\
        export function foo (arg: number): number;
				export function foo (arg: string): string;
				export function foo (arg: number|string): number|string {
					return arg;
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
		declare function foo(arg: number): number;
		declare function foo(arg: string): string;
		export { foo };
		`)
	);
});

test.serial("Will allow local conflicting symbols with external module symbols. #1", "*", async (t, {typescript, rollup}) => {
	const bundle = await generateRollupBundle(
		[
			...createBuiltInModuleTestFiles("fs"),
			{
				entry: true,
				fileName: "index.ts",
				text: `\
        export * from "./b";
        export * from "./utils";
				export * from "./a";
			`
			},
			{
				entry: false,
				fileName: "a.ts",
				text: `\
        import * as fs from "fs";

				export class Foo {
					bar: typeof fs.Stats;
				}
			`
			},
			{
				entry: false,
				fileName: "b.ts",
				text: `\
					import * as fs from "fs";
					export const stats = new fs.Stats();
				`
			},
			{
				entry: false,
				fileName: "utils.ts",
				text: `\
					export namespace fs {
						export function blah() { return "I'm a string!"; }
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
			/// <reference types="node" />
			import * as fs from "fs";
			declare const stats: fs.Stats;
			declare namespace fs$0 {
					function blah(): string;
			}
			declare class Foo {
					bar: typeof fs.Stats;
			}
			export { stats, fs$0 as fs, Foo };
		`)
	);
});

test.serial("Will allow local conflicting symbols with external module symbols. #2", "*", async (t, {typescript, rollup}) => {
	const bundle = await generateRollupBundle(
		[
			...createBuiltInModuleTestFiles("fs"),
			{
				entry: true,
				fileName: "index.ts",
				text: `\
        export * from "./b";
        export * from "./utils";
				export * from "./a";
			`
			},
			{
				entry: false,
				fileName: "a.ts",
				text: `\
        import fs from "fs";

				export class Foo {
					bar: typeof fs.Stats;
				}
			`
			},
			{
				entry: false,
				fileName: "b.ts",
				text: `\
					import fs from "fs";
					export const stats = new fs.Stats();
				`
			},
			{
				entry: false,
				fileName: "utils.ts",
				text: `\
					export namespace fs {
						export function blah() { return "I'm a string!"; }
					}
				`
			}
		],
		{
			typescript,
			rollup,
			debug: false,
			tsconfig: {
				allowSyntheticDefaultImports: true
			}
		}
	);
	const {
		declarations: [file]
	} = bundle;

	t.deepEqual(
		formatCode(file.code),
		formatCode(`\
			/// <reference types="node" />
			import fs from "fs";
			declare const stats: fs.Stats;
			declare namespace fs$0 {
					function blah(): string;
			}
			declare class Foo {
					bar: typeof fs.Stats;
			}
			export { stats, fs$0 as fs, Foo };
		`)
	);
});

test.serial("Will allow local conflicting symbols with external module symbols. #3", "*", async (t, {typescript, rollup}) => {
	const bundle = await generateRollupBundle(
		[
			...createBuiltInModuleTestFiles("fs"),
			{
				entry: true,
				fileName: "index.ts",
				text: `\
        export * from "./b";
        export * from "./utils";
				export * from "./a";
			`
			},
			{
				entry: false,
				fileName: "a.ts",
				text: `\
        import {truncate} from "fs";

				export class Foo {
					bar: typeof truncate.__promisify__;
				}
			`
			},
			{
				entry: false,
				fileName: "b.ts",
				text: `\
					import {truncate} from "fs";
					export const foo = truncate.__promisify__;
				`
			},
			{
				entry: false,
				fileName: "utils.ts",
				text: `\
					export namespace truncate {
						export function blah() { return "I'm a string!"; }
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
			/// <reference types="node" />
			import {truncate} from "fs";
			declare const foo: typeof truncate.__promisify__;
			declare namespace truncate$0 {
					function blah(): string;
			}
			declare class Foo {
					bar: typeof truncate.__promisify__;
			}
			export { foo, truncate$0 as truncate, Foo };
		`)
	);
});

test.serial("Won't deconflict shorthand PropertyAssignments. #1", "*", async (t, {typescript, rollup}) => {
	const bundle = await generateRollupBundle(
		[
			{
				entry: true,
				fileName: "index.ts",
				text: `\
        export * from "./first";
				export * from "./second";

			`
			},
			{
				entry: false,
				fileName: "first.ts",
				text: `\
        interface ConstructorParams {
					field: string;
				}
				
				export class First {
					private field: string;
					constructor({ field }: ConstructorParams) {
						this.field = field;
					}
				}

			`
			},
			{
				entry: false,
				fileName: "second.ts",
				text: `\
					interface ConstructorParams {
						field: string;
						otherField: string;
					}
					
					export class Second {
						private field: string;
						private otherField: string;
						constructor({ field, otherField }: ConstructorParams) {
							this.field = field;
							this.otherField = otherField;
						}
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
			interface ConstructorParams {
					field: string;
			}
			declare class First {
					private field;
					constructor({ field }: ConstructorParams);
			}
			interface ConstructorParams$0 {
					field: string;
					otherField: string;
			}
			declare class Second {
					private field;
					private otherField;
					constructor({ field, otherField }: ConstructorParams$0);
			}
			export { First, Second };
		`)
	);
});

test.serial("Namespace declarations should be merged rather than deconflicted. #1", "*", async (t, {typescript, rollup}) => {
	const bundle = await generateRollupBundle(
		[
			{
				entry: true,
				fileName: "index.ts",
				text: `\
					export { a } from './a'
					export { b } from './b'
			`
			},
			{
				entry: false,
				fileName: "a.ts",
				text: `\
					declare global {
						const good: string
					}
					export const a = good
			`
			},
			{
				entry: false,
				fileName: "b.ts",
				text: `\
					declare global {
						const bad: string
					}
					export const b = bad
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
			declare global {
					const good: string;
			}
			declare const a: string;
			declare global {
					const bad: string;
			}
			declare const b: string;
			export { a, b };
		`)
	);
});
