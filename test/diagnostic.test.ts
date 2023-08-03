import {test} from "./util/test-runner.js";
import {generateRollupBundle} from "./setup/setup-rollup.js";

test.serial("Will report diagnostics from the ParsedCommandLine. #1", "*", async (t, {typescript, rollup}) => {
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
			typescript,
			rollup,
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
