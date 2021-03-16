import test from "ava";
import withTypeScript, {withTypeScriptVersions} from "./util/ts-macro";
import {formatCode} from "./util/format-code";
import {generateRollupBundle} from "./setup/setup-rollup";

test.serial("Deconflicts symbols. #1", withTypeScript, async (t, {typescript}) => {
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

test.serial("Deconflicts symbols. #2", withTypeScript, async (t, {typescript}) => {
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

test.serial("Deconflicts symbols. #3", withTypeScript, async (t, {typescript}) => {
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

test.serial("Deconflicts symbols. #4", withTypeScript, async (t, {typescript}) => {
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

test.serial("Deconflicts symbols. #5", withTypeScript, async (t, {typescript}) => {
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

test.serial("Deconflicts symbols. #6", withTypeScript, async (t, {typescript}) => {
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

test.serial("Deconflicts symbols. #7", withTypeScript, async (t, {typescript}) => {
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

test.serial("Deconflicts symbols. #8", withTypeScript, async (t, {typescript, typescriptModuleSpecifier}) => {
	const bundle = await generateRollupBundle(
		[
			{
				entry: true,
				fileName: "index.ts",
				text: `\
					import {TS} from "./bar";
          export function foo<T extends TS.Node> (): void {
          }
					`
			},
			{
				entry: false,
				fileName: "bar.ts",
				text: `\
          import * as TS from "${typescriptModuleSpecifier}";
          export {TS};
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
		import * as TS from "${typescriptModuleSpecifier}";
		declare function foo<T extends TS.Node>(): void;
		export { foo };
		`)
	);
});

test.serial("Deconflicts symbols. #9", withTypeScript, async (t, {typescript}) => {
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

test.serial("Deconflicts symbols. #10", withTypeScript, async (t, {typescript}) => {
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

test.serial("Deconflicts symbols. #11", withTypeScript, async (t, {typescript, typescriptModuleSpecifier}) => {
	const bundle = await generateRollupBundle(
		[
			{
				entry: true,
				fileName: "index.ts",
				text: `\
					export {ModuleResolutionHost} from "./a";
					export {Bar} from "./b";
					`
			},
			{
				entry: false,
				fileName: "a.ts",
				text: `\
					import {ModuleResolutionHost as TSModuleResolutionHost} from "${typescriptModuleSpecifier}";

					export class ModuleResolutionHost implements TSModuleResolutionHost {
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
					import {ModuleResolutionHost} from "${typescriptModuleSpecifier}";

					export interface Bar {
						moduleResolutionHost: ModuleResolutionHost;
					};
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
			import { ModuleResolutionHost as TSModuleResolutionHost } from "${typescriptModuleSpecifier}";
			import { ModuleResolutionHost as ModuleResolutionHost$0 } from "${typescriptModuleSpecifier}";
			declare class ModuleResolutionHost implements TSModuleResolutionHost {
					fileExists(_fileName: string): boolean;
					readFile(_fileName: string, _encoding?: string): string | undefined;
			}
			interface Bar {
					moduleResolutionHost: ModuleResolutionHost$0;
			}
			export { ModuleResolutionHost, Bar };
		`)
	);
});

test.serial("Deconflicts symbols. #12", withTypeScript, async (t, {typescript, typescriptModuleSpecifier}) => {
	const bundle = await generateRollupBundle(
		[
			{
				entry: true,
				fileName: "index.ts",
				text: `\
					import {CustomTransformers} from "${typescriptModuleSpecifier}";
					export {Foo} from "./a";
					export interface Bar {
						transformers: CustomTransformers;
					}
					`
			},
			{
				entry: false,
				fileName: "a.ts",
				text: `\
					import {CustomTransformers} from "${typescriptModuleSpecifier}";

					export interface Foo {
						transformers: CustomTransformers;
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
			import { CustomTransformers } from "${typescriptModuleSpecifier}";
			interface Foo {
					transformers: CustomTransformers;
			}
			interface Bar {
					transformers: CustomTransformers;
			}
			export { Foo, Bar };
		`)
	);
});

test.serial("Deconflicts symbols. #13", withTypeScript, async (t, {typescript, typescriptModuleSpecifier}) => {
	const bundle = await generateRollupBundle(
		[
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
					export {ModuleResolutionHost} from "./b";
					export {Bar} from "./c";
			`
			},
			{
				entry: false,
				fileName: "b.ts",
				text: `\
					import {ModuleResolutionHost as TSModuleResolutionHost} from "${typescriptModuleSpecifier}";

					export class ModuleResolutionHost implements TSModuleResolutionHost {
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
					import {ModuleResolutionHost} from "${typescriptModuleSpecifier}";

					export interface Bar {
						moduleResolutionHost: ModuleResolutionHost;
					};
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
			import { ModuleResolutionHost as TSModuleResolutionHost } from "${typescriptModuleSpecifier}";
			import { ModuleResolutionHost as ModuleResolutionHost$0 } from "${typescriptModuleSpecifier}";
			declare class ModuleResolutionHost implements TSModuleResolutionHost {
					fileExists(_fileName: string): boolean;
					readFile(_fileName: string, _encoding?: string): string | undefined;
			}
			interface Bar {
					moduleResolutionHost: ModuleResolutionHost$0;
			}
			export { ModuleResolutionHost, Bar };
		`)
	);
});

test.serial("Deconflicts symbols. #14", withTypeScript, async (t, {typescript, typescriptModuleSpecifier}) => {
	const bundle = await generateRollupBundle(
		[
			{
				entry: true,
				fileName: "index.ts",
				text: `\
        import {tsModule} from "./bar";
        import {IFoo} from "./baz";

        export class Foo extends IFoo {
        	readonly ts: typeof tsModule;
        }
			`
			},
			{
				entry: false,
				fileName: "bar.ts",
				text: `\
			import * as tsModuleType from "${typescriptModuleSpecifier}";
			export const tsModule: { ts: typeof tsModuleType } = { ts: tsModuleType };
			`
			},
			{
				entry: false,
				fileName: "baz.ts",
				text: `\
			import * as tsModule from "${typescriptModuleSpecifier}";
			export class IFoo {
				readonly otherTs: typeof tsModule;
			}
			`
			},
			{
				entry: false,
				fileName: "qux.ts",
				text: `\
			import * as tsModule from "${typescriptModuleSpecifier}";
			export class IBar {
				readonly yetAnotherTs: typeof tsModule;
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
			import * as tsModuleType from "${typescriptModuleSpecifier}";
			import * as tsModule$0 from "${typescriptModuleSpecifier}";
			declare const tsModule: {
					ts: typeof tsModuleType;
			};
			declare class IFoo {
					readonly otherTs: typeof tsModule$0;
			}
			declare class Foo extends IFoo {
					readonly ts: typeof tsModule;
			}
			export { Foo };
		`)
	);
});

test.serial("Deconflicts symbols. #15", withTypeScript, async (t, {typescript}) => {
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

test.serial("Deconflicts symbols. #16", withTypeScript, async (t, {typescript}) => {
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

test.serial("Deconflicts symbols. #17", withTypeScript, async (t, {typescript}) => {
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

test.serial("Deconflicts symbols. #18", withTypeScript, async (t, {typescript}) => {
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

test.serial("Deconflicts symbols. #19", withTypeScript, async (t, {typescript}) => {
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

test.serial("Deconflicts symbols. #20", withTypeScript, async (t, {typescript}) => {
	const bundle = await generateRollupBundle(
		[
			{
				entry: true,
				fileName: "virtual-src/components/a.ts",
				text: `\
				export {Bar} from "./b";
        export const Foo = {} as unknown as import("..").Foo;
			`
			},
			{
				entry: false,
				fileName: "virtual-src/components/b.ts",
				text: `\
        type Foo = 2;
        export type Bar = Foo;
			`
			},
			{
				entry: true,
				fileName: "virtual-src/index.ts",
				text: `\
        export type Foo = {a: string; b: number};
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
		type Foo = 2;
		type Bar = Foo;
		declare const Foo$0: import("./index").Foo;
		export { Bar, Foo$0 as Foo };
		`)
	);
});

test.serial("Deconflicts symbols. #21", withTypeScriptVersions(">=4.1"), async (t, {typescript}) => {
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
export { HelloWorld, GoodbyeWorld };
	));
});

test.serial("Will merge declarations declared in same SourceFile rather than deconflict. #1", withTypeScript, async (t, {typescript}) => {
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

test.serial("Won't deconflict overloaded function signatures #1", withTypeScript, async (t, {typescript}) => {
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

test.serial("Will allow local conflicting symbols with external module symbols. #1", withTypeScript, async (t, {typescript}) => {
	const bundle = await generateRollupBundle(
		[
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

test.serial("Will allow local conflicting symbols with external module symbols. #2", withTypeScript, async (t, {typescript}) => {
	const bundle = await generateRollupBundle(
		[
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

test.serial("Will allow local conflicting symbols with external module symbols. #3", withTypeScript, async (t, {typescript}) => {
	const bundle = await generateRollupBundle(
		[
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

test.serial("Won't deconflict shorthand PropertyAssignments. #1", withTypeScript, async (t, {typescript}) => {
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

test.serial("Namespace declarations should be merged rather than deconflicted. #1", withTypeScript, async (t, {typescript}) => {
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
