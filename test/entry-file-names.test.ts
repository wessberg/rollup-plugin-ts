import test from "ava";
import withTypeScript from "./util/ts-macro";
import {generateRollupBundle} from "./setup/setup-rollup";
import {join, normalize} from "../src/util/path/path-util";

test("Supports rewritten paths with entryFileNames and chunkFileNames. #1", withTypeScript, async (t, {typescript}) => {
	const bundle = await generateRollupBundle(
		[
			{
				entry: true,
				fileName: "virtual_src/a.ts",
				text: `\
					export default {};
					export * from './c';
					export * from './d';
				`
			},
			{
				entry: true,
				fileName: "virtual_src/b.ts",
				text: `\
					export default {};
					export * from './c';
					export * from './d';
				`
			},
			{
				entry: false,
				fileName: "virtual_src/c.ts",
				text: `\
				export type c = Boolean;
				`
			},
			{
				entry: false,
				fileName: "virtual_src/d.ts",
				text: `\
				export const d = true;
				`
			}
		],
		{
			typescript,
			debug: false,
			dir: ".",
			chunkFileNames: "shared/[name].js",
			entryFileNames: "[name]/index.js"
		}
	);
	const {declarations} = bundle;
	const rootDir = join(__dirname, "../");
	const fileNames = declarations.map(d => normalize(d.fileName)).map(fileName => fileName.replace(rootDir, ""));
	t.deepEqual(fileNames, ["a/index.d.ts", "b/index.d.ts", "shared/d.d.ts", "shared/c.d.ts"]);
});
