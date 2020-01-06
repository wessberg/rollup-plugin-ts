import test from "ava";
import {generateRollupBundle} from "./setup/setup-rollup";

// tslint:disable:no-duplicate-string
test("Will report diagnostics from the ParsedCommandLine. #1", async t => {
	let hasReportedDiagnostic = false;
	await generateRollupBundle(
		[
			{
				entry: true,
				fileName: "index.ts",
				text: `\
					`
			}
		],
		{
			debug: false,
			hook: {
				diagnostics: diagnostics => {
					hasReportedDiagnostic = diagnostics.length > 0;
					return [];
				}
			},
			tsconfig: {
				unsupportedOption: "foo"
			}
		}
	);

	t.true(hasReportedDiagnostic);
});
