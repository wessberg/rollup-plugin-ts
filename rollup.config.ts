import ts from "./src/index.js";
import {rollup} from "rollup";
import pkg from "./package.json" assert {type: "json"};
import {builtinModules} from "module";

(async () => {
	const bundle = await rollup({
		input: "src/index.ts",
		plugins: [
			ts({
				tsconfig: "tsconfig.build.json"
			})
		],
		external: [...builtinModules, ...Object.keys(pkg.dependencies ?? {}), ...Object.keys(pkg.devDependencies ?? {}), ...Object.keys(pkg.peerDependencies ?? {})]
	});

	await Promise.all(
		(
			[
				{
					file: pkg.main,
					format: "cjs",
					sourcemap: true,
					exports: "default"
				},
				{
					file: pkg.module,
					format: "esm",
					sourcemap: true
				}
			] as const
		).map(bundle.write)
	);
})().catch(ex => {
	console.error(ex);
	process.exit(1);
});
