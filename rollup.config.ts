import ts from "./src/index.js";
import {rollup} from "rollup";
import pkg from "./package.json" assert {type: "json"};
import {builtinModules} from "module";

const SHARED_OUTPUT_OPTIONS = {
	sourcemap: true,
	hoistTransitiveImports: false,
	generatedCode: "es2015",
	compact: false,
	minifyInternalExports: false
} as const;

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
					file: pkg.exports.require,
					format: "cjs",
					exports: "default",
					...SHARED_OUTPUT_OPTIONS
				},
				{
					file: pkg.exports.import,
					format: "esm",
					...SHARED_OUTPUT_OPTIONS
				}
			] as const
		).map(bundle.write)
	);
})().catch(ex => {
	console.error(ex);
	process.exit(1);
});
