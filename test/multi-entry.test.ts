import test from "ava";
import withTypeScript from "./util/ts-macro";
import {generateRollupBundle} from "./setup/setup-rollup";
import multiEntry from "@rollup/plugin-multi-entry";
import {formatCode} from "./util/format-code";
import {createTemporaryFile} from "./util/create-temporary-file";
import {generateRandomHash} from "../src/util/hash/generate-random-hash";

const windowsFailingTest = process.platform === "win32" ? test.failing : test;
windowsFailingTest("Can generate declarations for a virtual entry file using @rollup/plugin-multi-entry #1", withTypeScript, async (t, {typescript}) => {
	const unlinkerA = createTemporaryFile(
		`${generateRandomHash()}.ts`,
		`
		export type A = {
			foo: boolean;
		};
		export const a: A = {
			foo: true,
		};
	`
	);

	const unlinkerB = createTemporaryFile(
		`${generateRandomHash()}.ts`,
		`
		export type B = {
			bar: number;
		};
					
		export const b: B = {
			bar: 1,
		};
	`
	);

	try {
		const bundle = await generateRollupBundle(
			[
				{
					entry: false,
					fileName: unlinkerA.path
				},
				{
					entry: false,
					fileName: unlinkerB.path
				}
			],
			{
				typescript,
				debug: false,
				prePlugins: [multiEntry()]
			}
		);
		const {
			declarations: [file]
		} = bundle;

		t.deepEqual(
			formatCode(file.code),
			formatCode(`\
			type B = {
					bar: number;
			};
			declare const b: B;
			type A = {
					foo: boolean;
			};
			declare const a: A;
			export { B, b, A, a };
		`)
		);
	} finally {
		unlinkerA.cleanup();
		unlinkerB.cleanup();
	}
});
