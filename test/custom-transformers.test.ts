import test from "./util/test-runner";
import {formatCode} from "./util/format-code";
import {generateRollupBundle} from "./setup/setup-rollup";
import {TS} from "../src/type/ts";
import {isNodeFactory} from "../src/service/transformer/declaration-bundler/util/is-node-factory";

test("Supports Custom Transformers, including on bundled declarations. #1", async (t, {typescript}) => {
	const transformer: (ts: typeof TS) => TS.TransformerFactory<TS.SourceFile> = ts => context => sourceFile => {
		const compatFactory = (context.factory as TS.NodeFactory | undefined) ?? ts;

		function visitNode(node: TS.Node): TS.VisitResult<TS.Node> {
			if (ts.isClassDeclaration(node)) {
				return compatFactory.updateClassDeclaration(
					node,
					node.decorators,
					node.modifiers,
					compatFactory.createIdentifier("Bar"),
					node.typeParameters,
					node.heritageClauses,
					node.members
				);
			} else if (ts.isExportSpecifier(node)) {
				return compatFactory.updateExportSpecifier(node, node.propertyName, compatFactory.createIdentifier("Bar"));
			} else {
				return ts.visitEachChild(node, visitNode, context);
			}
		}

		return ts.visitEachChild(sourceFile, visitNode, context);
	};

	const bundle = await generateRollupBundle(
		[
			{
				entry: true,
				fileName: "index.ts",
				text: `\
					export class Foo {}
					`
			}
		],
		{
			typescript,
			debug: false,
			transformers: ({typescript: ts}) => ({
				before: [transformer(ts)],
				afterDeclarations: [transformer(ts) as TS.TransformerFactory<TS.SourceFile | TS.Bundle>]
			})
		}
	);
	const {
		declarations: [declarationFile],
		bundle: {
			output: [file]
		}
	} = bundle;

	t.deepEqual(
		formatCode(declarationFile.code),
		formatCode(`\
		declare class Bar {
		}
		export {Bar};
		`)
	);

	t.deepEqual(
		formatCode(file.code),
		formatCode(`\
		class Bar {
		}

		export {Bar};
		`)
	);
});

test("Supports Custom Transformers, including on bundled declarations. #2", async (t, {typescript}) => {
	const bundle = await generateRollupBundle(
		[
			{
				entry: true,
				fileName: "index.ts",
				text: `\
					export class Foo {}
					`
			}
		],
		{
			typescript,
			debug: false,
			transformers: ({typescript: ts}) => ({
				after: [
					context => sourceFile => {
						const compatFactory = (context.factory as TS.NodeFactory | undefined) ?? ts;

						if (isNodeFactory(compatFactory)) {
							return compatFactory.updateSourceFile(sourceFile, [
								...sourceFile.statements,
								compatFactory.createExpressionStatement(
									compatFactory.createCallExpression(
										compatFactory.createPropertyAccessExpression(compatFactory.createIdentifier("console"), compatFactory.createIdentifier("log")),
										undefined,
										[compatFactory.createStringLiteral("foo")]
									)
								)
							]);
						} else {
							return compatFactory.updateSourceFileNode(sourceFile, [
								...sourceFile.statements,
								compatFactory.createExpressionStatement(
									compatFactory.createCall(compatFactory.createPropertyAccess(compatFactory.createIdentifier("console"), compatFactory.createIdentifier("log")), undefined, [
										compatFactory.createStringLiteral("foo")
									])
								)
							]);
						}
					}
				]
			})
		}
	);
	const {
		declarations: [declarationFile],
		bundle: {
			output: [file]
		}
	} = bundle;

	t.deepEqual(
		formatCode(declarationFile.code),
		formatCode(`\
		declare class Foo {
		}
		export {Foo};
		`)
	);

	t.deepEqual(
		formatCode(file.code),
		formatCode(`\
		class Foo {
		}
		console.log("foo");

		export {Foo};
		`)
	);
});

test("Supports adding diagnostics from Custom Transformers. #1", async (t, {typescript}) => {
	let hadDiagnostic = false;
	await generateRollupBundle(
		[
			{
				entry: true,
				fileName: "index.ts",
				text: `\
					export class Foo {}
					`
			}
		],
		{
			typescript,
			debug: false,
			hook: {
				diagnostics: diagnostics => {
					hadDiagnostic = diagnostics.length > 0;
					return [];
				}
			},
			transformers: ({addDiagnostics, typescript: ts}) => ({
				before: [
					() => sourceFile => {
						addDiagnostics({
							code: 123,
							category: ts.DiagnosticCategory.Error,
							messageText: `This is a custom diagnostic`,
							file: sourceFile,
							start: 0,
							length: 0
						});
						return sourceFile;
					}
				]
			})
		}
	);
	t.true(hadDiagnostic);
});
