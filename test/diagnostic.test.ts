import test from "ava";
import {withTypeScript} from "./util/ts-macro";
import {generateRollupBundle} from "./setup/setup-rollup";

test.serial("Will report diagnostics from the ParsedCommandLine. #1", withTypeScript, async (t, {typescript}) => {
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
