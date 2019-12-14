import test from "ava";
import {formatCode} from "./util/format-code";
import {generateRollupBundle} from "./setup/setup-rollup";
// tslint:disable:no-duplicate-string

test("Deconflicts symbols. #1", async t => {
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
		{debug: true}
	);
	const {
		declarations: [file]
	} = bundle;

	t.deepEqual(
		formatCode(file.code),
		formatCode(`\
			declare class Foo {
			}
			declare const OtherFoo: typeof Foo;
			declare class Foo$0 extends OtherFoo {
			}
			export { Foo$0 as Foo };
		`)
	);
});

test("Deconflicts symbols. #2", async t => {
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
		{debug: true}
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

test("Deconflicts symbols. #3", async t => {
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
		{debug: true}
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
			declare const OriginalB: typeof B;
			declare class B$0 extends OriginalB {
					someOtherProp: string;
			}
			export { A, B$0 as B };
		`)
	);
});

test("Deconflicts symbols. #4", async t => {
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
		{debug: true}
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

test("Deconflicts symbols. #5", async t => {
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
		{debug: true}
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

test("Deconflicts symbols. #6", async t => {
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
		{debug: true}
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

test("Deconflicts symbols. #7", async t => {
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
		{debug: true}
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

test("Deconflicts symbols. #8", async t => {
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
          import * as TS from "typescript";
          export {TS};
					`
			}
		],
		{debug: true}
	);
	const {
		declarations: [file]
	} = bundle;

	t.deepEqual(
		formatCode(file.code),
		formatCode(`\
		import * as TS from "typescript";
		declare function foo<T extends TS.Node>(): void;
		export { foo };
		`)
	);
});

test("Deconflicts symbols. #9", async t => {
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
		{debug: true}
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

test("Deconflicts symbols. #10", async t => {
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
		{debug: true}
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

test("Deconflicts symbols. #11", async t => {
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
					import {ModuleResolutionHost as TSModuleResolutionHost} from "typescript";

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
					import {ModuleResolutionHost} from "typescript";

					export interface Bar {
						moduleResolutionHost: ModuleResolutionHost;
					};
					`
			}
		],
		{debug: true}
	);
	const {
		declarations: [file]
	} = bundle;

	t.deepEqual(
		formatCode(file.code),
		formatCode(`\
			import { ModuleResolutionHost as TSModuleResolutionHost } from "typescript";
			import { ModuleResolutionHost as ModuleResolutionHost$0 } from "typescript";
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

test("Deconflicts symbols. #12", async t => {
	const bundle = await generateRollupBundle(
		[
			{
				entry: true,
				fileName: "index.ts",
				text: `\
					import {CustomTransformers} from "typescript";
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
					import {CustomTransformers} from "typescript";

					export interface Foo {
						transformers: CustomTransformers;
					}
					`
			}
		],
		{debug: true}
	);
	const {
		declarations: [file]
	} = bundle;

	t.deepEqual(
		formatCode(file.code),
		formatCode(`\
			import { CustomTransformers } from "typescript";
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

test("Deconflicts symbols. #13", async t => {
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
					import {ModuleResolutionHost as TSModuleResolutionHost} from "typescript";

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
					import {ModuleResolutionHost} from "typescript";

					export interface Bar {
						moduleResolutionHost: ModuleResolutionHost;
					};
					`
			}
		],
		{debug: true}
	);
	const {
		declarations: [file]
	} = bundle;

	t.deepEqual(
		formatCode(file.code),
		formatCode(`\
			import { ModuleResolutionHost as TSModuleResolutionHost } from "typescript";
			import { ModuleResolutionHost as ModuleResolutionHost$0 } from "typescript";
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

test("Deconflicts symbols. #14", async t => {
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
			import * as tsModuleType from "typescript";
			export const tsModule: { ts: typeof tsModuleType } = { ts: tsModuleType };
			`
			},
			{
				entry: false,
				fileName: "baz.ts",
				text: `\
			import * as tsModule from "typescript";
			export class IFoo {
				readonly otherTs: typeof tsModule;
			}
			`
			},
			{
				entry: false,
				fileName: "qux.ts",
				text: `\
			import * as tsModule from "typescript";
			export class IBar {
				readonly yetAnotherTs: typeof tsModule;
			}
			`
			}
		],
		{debug: true}
	);
	const {
		declarations: [file]
	} = bundle;

	t.deepEqual(
		formatCode(file.code),
		formatCode(`\
			import * as tsModuleType from "typescript";
			import * as tsModule$0 from "typescript";
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

test("Deconflicts symbols. #15", async t => {
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
		{debug: true}
	);
	const {
		declarations: [file]
	} = bundle;

	t.deepEqual(
		formatCode(file.code),
		formatCode(`\
			declare function foo(): void;
			const enum foo$0 {
					FOO = "FOO"
			}
			declare const baz: foo$0;
			export { foo, foo as bar, baz };
		`)
	);
});

test("Deconflicts symbols. #16", async t => {
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
		{debug: true}
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

test("Deconflicts symbols. #17", async t => {
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
		{debug: true}
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
