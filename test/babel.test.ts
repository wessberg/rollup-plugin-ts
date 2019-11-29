import test from "ava";
import {generateRollupBundle} from "./setup/setup-rollup";
// tslint:disable:no-duplicate-string

test("Can handle 'babel' as the transpiler. #1", async t => {
	await t.notThrowsAsync(
		async () =>
			await generateRollupBundle(
				[
					{
						entry: true,
						fileName: "index.ts",
						text: `\
					const foo = typeof Symbol.iterator;
					console.log(foo, ...([1, 2, {...{a: 1}}]));
					`
					}
				],
				{
					transpiler: "babel",
					tsconfig: {
						target: "es5"
					}
				}
			)
	);
});
