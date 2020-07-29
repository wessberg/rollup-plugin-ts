import test from "./util/test-runner";
import {formatCode} from "./util/format-code";
import {generateRollupBundle} from "./setup/setup-rollup";
import {DeclarationStats} from "../src/type/declaration-stats";

test("Declarations respect rewritten output paths. #1", async (t, {typescript}) => {
	const bundle = await generateRollupBundle(
		[
			{
				entry: true,
				fileName: "index.ts",
				text: `\
					import {Foo} from "./foo";
					export {Foo}
					`
			},
			{
				entry: false,
				fileName: "foo.ts",
				text: `\
					export type Foo = string;
					`
			}
		],
		{
			typescript,
			debug: false,
			tsconfig: {
				declarationMap: true,
				declarationDir: "./foobarbaz"
			},
			hook: {
				outputPath: path => path.replace("index.d.ts", "some-other-dir/hey/there/index-rewritten.d.ts")
			}
		}
	);
	const {
		declarations: [file]
	} = bundle;

	t.deepEqual(
		formatCode(file.code),
		formatCode(`\
		type Foo = string;
		export {Foo};
		//# sourceMappingURL=index-rewritten.d.ts.map
		`)
	);
});

test("Diagnostics can be filtered with the 'diagnostics' hook. #1", async (t, {typescript}) => {
	const bundle = await generateRollupBundle(
		[
			{
				entry: true,
				fileName: "index.ts",
				text: `\
					export const foo: number = String(2);
					`
			}
		],
		{
			typescript,
			hook: {
				diagnostics: () => undefined
			}
		}
	);
	const {
		declarations: [file]
	} = bundle;

	t.deepEqual(
		formatCode(file.code),
		formatCode(`\
		declare const foo: number;
		export {foo};
		`)
	);
});

test("External types can be retrieved with the 'declarationStats' hook. #1", async (t, {typescript, typescriptModuleSpecifier}) => {
	let stats: DeclarationStats | undefined;

	await generateRollupBundle(
		[
			{
				entry: true,
				fileName: "index.ts",
				text: `\
					import {SyntaxKind} from "${typescriptModuleSpecifier}";
					export const foo = SyntaxKind;
					export const bar = Buffer.from("");
					`
			}
		],
		{
			typescript,
			hook: {
				declarationStats: declarationStats => (stats = declarationStats)
			}
		}
	);

	console.log(stats?.externalTypes);
	t.true(stats != null);
	t.true(stats?.externalTypes["index.d.ts"] != null);
	t.true(stats?.externalTypes["index.d.ts"][0] != null);
	t.true(stats?.externalTypes["index.d.ts"][0].library === "typescript");
	t.true(stats?.externalTypes["index.d.ts"][1] != null);
	t.true(stats?.externalTypes["index.d.ts"][1].library === "@types/node");
});
