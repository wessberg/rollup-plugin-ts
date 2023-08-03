import {test} from "./util/test-runner.js";
import {generateRollupBundle} from "./setup/setup-rollup.js";
import {formatCode} from "./util/format-code.js";

test.serial("Will treat every file as a module with tslib. #1", {ts: ">=3.6"}, async (t, {typescript, rollup}) => {
	const bundle = await generateRollupBundle(
		[
			{
				entry: true,
				fileName: "index.ts",
				text: `\
						(async () => {})();
					`
			}
		],
		{
			typescript,
			rollup,
			rollupOptions: {
				external: ["tslib"]
			},

			tsconfig: {
				target: "es3",
				lib: ["esnext"]
			}
		}
	);
	const {
		bundle: {
			output: [file]
		}
	} = bundle;

	t.deepEqual(
		formatCode(file.code),
		formatCode(`\
				import { __awaiter, __generator } from 'tslib';

				(function () { return __awaiter(void 0, void 0, void 0, function () { return __generator(this, function (_a) {
						return [2 /*return*/];
				}); }); })();
			`)
	);
});
