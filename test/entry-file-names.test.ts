import test from "ava";
import {withTypeScript} from "./util/ts-macro.js";
import {generateRollupBundle} from "./setup/setup-rollup.js";
import path from "crosspath";

test.serial("Supports rewritten paths with entryFileNames and chunkFileNames. #1", withTypeScript, async (t, {typescript}) => {
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
			chunkFileNames: "shared/[name].js",
			entryFileNames: "[name]/index.js"
		}
	);
	const {declarations} = bundle;
	const rootDir = path.join(path.dirname(path.urlToFilename(import.meta.url)), "../");
	const fileNames = declarations.map(d => path.normalize(d.fileName)).map(fileName => fileName.replace(rootDir, ""));
	t.deepEqual(fileNames, ["a/index.d.ts", "b/index.d.ts", "shared/d.d.ts", "shared/c.d.ts"]);
});
