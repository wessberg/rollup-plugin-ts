import {OutputBundle, OutputOptions, PluginContext} from "rollup";
import {CompilerHost} from "../../compiler-host/compiler-host";
import {TypescriptPluginOptions} from "../../../plugin/i-typescript-plugin-options";
import {join, nativeNormalize, relative} from "../../../util/path/path-util";
import {getOutDir} from "../../../util/get-out-dir/get-out-dir";
import {isBuildInfoOutputFile} from "../../../util/is-build-info-output-file/is-build-info-output-file";
import {shouldDebugEmit} from "../../../util/is-debug/should-debug";
import {logEmit} from "../../../util/logging/log-emit";

export interface EmitBuildInfoOptions {
	pluginContext: PluginContext;
	bundle: OutputBundle;
	host: CompilerHost;
	pluginOptions: TypescriptPluginOptions;
	outputOptions: OutputOptions;
}

export function emitBuildInfo(options: EmitBuildInfoOptions): void {
	const compilationSettings = options.host.getCompilationSettings();
	if (compilationSettings.tsBuildInfoFile == null) return;

	const emitResult = options.host.emitBuildInfo();
	const buildInfo = emitResult.outputFiles.find(isBuildInfoOutputFile);
	if (buildInfo == null) return;

	const cwd = options.host.getCwd();
	const relativeOutDir = getOutDir(cwd, options.outputOptions);
	let outputPathCandidate = compilationSettings.tsBuildInfoFile;

	// Rewrite the path
	if (options.pluginOptions.hook.outputPath != null) {
		const result = options.pluginOptions.hook.outputPath(outputPathCandidate, "buildInfo");

		if (result != null) {
			outputPathCandidate = result;
		}
	}

	if (shouldDebugEmit(options.pluginOptions.debug, outputPathCandidate, buildInfo.text, "buildInfo")) {
		logEmit(outputPathCandidate, buildInfo.text);
	}

	const emitFile = join(relative(relativeOutDir, outputPathCandidate));
	// Rollup does not allow emitting files outside of the root of the whatever 'dist' directory that has been provided.
	// Under such circumstances, unfortunately, we'll have to default to using whatever FileSystem was provided to write the file to disk
	const needsFileSystem = emitFile.startsWith("../") || emitFile.startsWith("..\\") || options.pluginContext.emitFile == null;

	if (needsFileSystem) {
		options.host.getFileSystem().writeFile(nativeNormalize(outputPathCandidate), buildInfo.text);
	}

	// Otherwise, we can use Rollup, which is absolutely preferable
	else {
		options.pluginContext.emitFile({
			type: "asset",
			source: buildInfo.text,
			fileName: nativeNormalize(emitFile)
		});
	}
}
