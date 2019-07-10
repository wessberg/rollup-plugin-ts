import test from "ava";
import {generateRollupBundle} from "./setup/setup-rollup";

test("Won't duplicate identifiers for circular references. #1", async t => {
	const bundle = await generateRollupBundle([
		{
			entry: true,
			fileName: "index.ts",
			text: `\	
				import * as math from './math'
				
				export interface ITest {
						// defaultFactor: number
						mul: () => number
				}
				
				export class Test implements ITest {
						public static defaultFactor = 1
						public mul() {
								return math.mult(2)
						}
				}
				
				const t = new Test()
				console.log(t.mul())
					`
		},
		{
			entry: false,
			fileName: "math.ts",
			text: `
				import {Test} from "./index";

				export const double = (x: number) => x * 2
				export const mult = (x: number, y: number = Test.defaultFactor) => x * y
			`
		}
	]);
	const {
		bundle: {
			output: [file]
		}
	} = bundle;
	console.log(file.code);
	t.true(true);
});
