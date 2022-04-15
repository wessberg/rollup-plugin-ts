import test from "ava";
import {withTypeScript} from "./util/ts-macro";
import {formatCode} from "./util/format-code";
import {generateRollupBundle} from "./setup/setup-rollup";
import {createExternalTestFiles} from "./setup/test-file";

test.serial("Handles default export assignments. #1", withTypeScript, async (t, {typescript}) => {
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

test.serial("Handles default export assignments. #2", withTypeScript, async (t, {typescript}) => {
	const bundle = await generateRollupBundle(
		[
			{
				entry: true,
				fileName: "index.ts",
				text: `\
					import Bar from "./bar";
					export interface Foo extends Bar {}
					`
			},
			{
				entry: false,
				fileName: "bar.ts",
				text: `\
					export default interface Bar {
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

test.serial("Handles default export assignments. #3", withTypeScript, async (t, {typescript}) => {
	const bundle = await generateRollupBundle(
		[
			{
				entry: true,
				fileName: "index.ts",
				text: `\
          		import X from './bar';
          		export { X }
        	`
			},
			{
				entry: false,
				fileName: "bar.ts",
				text: `\
				interface Foo { n: number; }
				export const fn = (x: Foo): Foo => x;
				export default fn({ n: 0 });
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
				n: number;
		}
		declare const _default: Foo;
		declare const X: typeof _default;
		export { X };
		`)
	);
});

test.serial("Handles default export assignments. #4", withTypeScript, async (t, {typescript}) => {
	const bundle = await generateRollupBundle(
		[
			{
				entry: true,
				fileName: "index.ts",
				text: `\
          		import X from './bar';
          		export { X }
        	`
			},
			{
				entry: false,
				fileName: "bar.ts",
				text: `\
				export default function foo (): string {return "";} `
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
		declare function foo(): string;
		declare const X: typeof foo;
		export { X };
		`)
	);
});

test.serial("Handles default export assignments. #5", withTypeScript, async (t, {typescript}) => {
	const bundle = await generateRollupBundle(
		[
			{
				entry: true,
				fileName: "index.ts",
				text: `\
          		import X from './bar';
          		export { X }
        	`
			},
			{
				entry: false,
				fileName: "bar.ts",
				text: `\
				enum FooKind {A, B}
				export default FooKind;
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
		declare enum FooKind {
			A = 0,
			B = 1
		}
		declare const X: typeof FooKind;
		export { X };
		`)
	);
});

test.serial("Handles default export assignments. #6", withTypeScript, async (t, {typescript}) => {
	const bundle = await generateRollupBundle(
		[
			{
				entry: true,
				fileName: "index.ts",
				text: `\
          		import X from './bar';
          		export { X }
        	`
			},
			{
				entry: false,
				fileName: "bar.ts",
				text: `\
				interface FooKind {}
				export default FooKind;
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
		interface FooKind {
		}
		type X = FooKind;
		export { X };
		`)
	);
});

test.serial("Handles default export assignments. #7", withTypeScript, async (t, {typescript}) => {
	const bundle = await generateRollupBundle(
		[
			{
				entry: true,
				fileName: "index.ts",
				text: `\
							export {default} from "./foo";
        	`
			},
			{
				entry: false,
				fileName: "foo.ts",
				text: `\
				export default function foo () {}
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
			declare function foo (): void;
			export {foo as default};
		`)
	);
});

test.serial("Handles default export assignments. #8", withTypeScript, async (t, {typescript}) => {
	const bundle = await generateRollupBundle(
		[
			{
				entry: true,
				fileName: "index.ts",
				text: `\
						export default class DefaultClass {
							private static readonly constant = 0;
						
							public static staticMethod(): void {
								console.log(DefaultClass.constant)
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
			declare class DefaultClass {
				private static readonly constant;
				static staticMethod(): void;
			}
				export { DefaultClass as default };
		`)
	);
});

test.serial("Handles default exports inside ExportSpecifiers. #1", withTypeScript, async (t, {typescript}) => {
	const bundle = await generateRollupBundle(
		[
			...createExternalTestFiles(
				"my-library",
				`\
					export default function foo (): void;
				`
			),
			{
				entry: true,
				fileName: "index.ts",
				text: `\
          import foo from './bar';
					export const Foo = foo;
					`
			},
			{
				entry: false,
				fileName: "bar.ts",
				text: `\
          export {default} from 'my-library';
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
		import foo from "my-library";
		declare const Foo: typeof foo;
		export {Foo};
		`)
	);
});

test.serial("Handles default exports inside ExportSpecifiers. #2", withTypeScript, async (t, {typescript}) => {
	const bundle = await generateRollupBundle(
		[
			...createExternalTestFiles(
				"my-library",
				`\
					export default function foo (): void;
				`
			),
			{
				entry: true,
				fileName: "index.ts",
				text: `\
          import foo from './bar';
					export const Foo = foo;
					`
			},
			{
				entry: false,
				fileName: "bar.ts",
				text: `\
          export {default as default} from 'my-library';
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
		import foo from "my-library";
		declare const Foo: typeof foo;
		export {Foo};
		`)
	);
});

test.serial("Handles default exports inside ExportSpecifiers. #3", withTypeScript, async (t, {typescript}) => {
	const bundle = await generateRollupBundle(
		[
			...createExternalTestFiles(
				"my-library",
				`\
					export default function foo (): void;
				`
			),
			{
				entry: true,
				fileName: "index.ts",
				text: `\
          import {Bar} from './bar';
					export const Foo = Bar;
					`
			},
			{
				entry: false,
				fileName: "bar.ts",
				text: `\
          export {default as Bar} from 'my-library';
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
		import { default as Bar } from "my-library";
		declare const Foo: typeof Bar;
		export {Foo};
		`)
	);
});

test.serial("Handles default exports inside ExportSpecifiers. #4", withTypeScript, async (t, {typescript}) => {
	const bundle = await generateRollupBundle(
		[
			{
				entry: true,
				fileName: "index.ts",
				text: `\
          export { default as Foo } from "./foo";
					`
			},
			{
				entry: false,
				fileName: "foo.ts",
				text: `\
          function Foo(a: string, b: string): string {
						return a + b;
					}
					Foo.tags = ['foo', 'bar', 'baz'];
					
					export default Foo;
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
		declare function Foo(a: string, b: string): string;
		declare namespace Foo {
				var tags: string[];
		}
		export { Foo };
		`)
	);
});

test.serial("Handles default exports inside ExportSpecifiers. #5", withTypeScript, async (t, {typescript}) => {
	const bundle = await generateRollupBundle(
		[
			{
				entry: true,
				fileName: "index.ts",
				text: `\
				import Foo from "./foo";
				
				export { Foo };
					`
			},
			{
				entry: false,
				fileName: "foo.ts",
				text: `\
				export { default } from "./bar";
					`
			},
			{
				entry: false,
				fileName: "bar.ts",
				text: `\
				export default 2;
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
		declare const _default: 2;
		declare const __default: typeof _default;
		declare const Foo: typeof __default;
		export { Foo };
		`)
	);
});

test.serial("Handles default exports inside ExportSpecifiers. #6", withTypeScript, async (t, {typescript}) => {
	const bundle = await generateRollupBundle(
		[
			{
				entry: true,
				fileName: "index.ts",
				text: `\
				import Foo from "./foo";
				
				export { Foo };
					`
			},
			{
				entry: false,
				fileName: "foo.ts",
				text: `\
				export { A as default } from "./bar";
					`
			},
			{
				entry: false,
				fileName: "bar.ts",
				text: `\
				const foo = 2;
				export {foo as A};
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
		declare const foo = 2;
		declare const __default: typeof foo;
		declare const A: typeof __default;
		declare const Foo: typeof A;
		export { Foo };
		`)
	);
});

test.serial("Handles default exports inside ExportSpecifiers. #7", withTypeScript, async (t, {typescript}) => {
	const bundle = await generateRollupBundle(
		[
			{
				entry: true,
				fileName: "index.ts",
				text: `\
				import {A} from "./foo";
				
				export { A };
					`
			},
			{
				entry: false,
				fileName: "foo.ts",
				text: `\
				export { A } from "./bar";
					`
			},
			{
				entry: false,
				fileName: "bar.ts",
				text: `\
				const foo = 2;
				export {foo as A};
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
		declare const foo = 2;
		declare const A: typeof foo;
		export { A };
		`)
	);
});

test.serial("Handles default exports inside ExportSpecifiers. #8", withTypeScript, async (t, {typescript}) => {
	const bundle = await generateRollupBundle(
		[
			{
				entry: true,
				fileName: "index.ts",
				text: `\
				import {A} from "./foo";
				
				const B = A;
				export { A as ARenamed, B };
					`
			},
			{
				entry: false,
				fileName: "foo.ts",
				text: `\
				export { A } from "./bar";
					`
			},
			{
				entry: false,
				fileName: "bar.ts",
				text: `\
				const foo = 2;
				export {foo as A};
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
		declare const foo = 2;
		declare const A: typeof foo;
		declare const B = 2;
		export { A as ARenamed, B };
		`)
	);
});

test.serial("Handles default exports inside ExportSpecifiers. #9", withTypeScript, async (t, {typescript}) => {
	const bundle = await generateRollupBundle(
		[
			{
				entry: true,
				fileName: "index.ts",
				text: `\
				export { default as Bar } from "./bar";
				export { default as Foo } from "./foo";
					`
			},
			{
				entry: false,
				fileName: "bar/index.ts",
				text: `\
				export { default } from "./bar";
					`
			},
			{
				entry: false,
				fileName: "bar/bar.ts",
				text: `\
					interface Bar {
						bar: string;
				  	}
				  
				  	export default Bar;
				  
					`
			},
			{
				entry: false,
				fileName: "foo/index.ts",
				text: `\
				export { default } from "./foo";
					`
			},
			{
				entry: false,
				fileName: "foo/foo.ts",
				text: `\
					interface Foo {
						foo: string;
				  	}
				  
				  	export default Foo;
				  
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
			bar: string;
		}
		type __default = Bar;
		interface Foo {
			foo: string;
		}
		type __default$0 = Foo;
		export { __default as Bar, __default$0 as Foo };
		`)
	);
});

test.serial("Handles default exports inside ExportSpecifiers. #10", withTypeScript, async (t, {typescript}) => {
	const bundle = await generateRollupBundle(
		[
			{
				entry: true,
				fileName: "index.ts",
				text: `\
				export { default as Bar } from "./bar";
				export { default as Foo } from "./foo";

					`
			},
			{
				entry: false,
				fileName: "bar/index.ts",
				text: `\
				export { default } from "./bar";
					`
			},
			{
				entry: false,
				fileName: "bar/bar.ts",
				text: `\
				  const Bar = 2;
				  
				  export default Bar;
				  
				  
					`
			},
			{
				entry: false,
				fileName: "foo/index.ts",
				text: `\
				export { default } from "./foo";
					`
			},
			{
				entry: false,
				fileName: "foo/foo.ts",
				text: `\
				const Foo = 4;
				  
				export default Foo;
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
		declare const Bar = 2;
		declare const __default: typeof Bar;
		declare const Foo = 4;
		declare const __default$0: typeof Foo;
		export { __default as Bar, __default$0 as Foo };
		`)
	);
});
