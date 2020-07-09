import test from "./util/test-runner";
import {generateRollupBundle} from "./setup/setup-rollup";

test("Will report diagnostics from the ParsedCommandLine. #1", async (t, {typescript}) => {
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
