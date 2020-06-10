import test from "ava";
import {formatCode} from "./util/format-code";
import {generateRollupBundle} from "./setup/setup-rollup";
import {TS} from "../src/type/ts";

test("Supports Custom Transformers, including on bundled declarations. #1", async t => {
	const transformer: (typescript: typeof TS) => TS.TransformerFactory<TS.SourceFile> = typescript => context => sourceFile => {
		function visitNode(node: TS.Node): TS.VisitResult<TS.Node> {
			if (typescript.isClassDeclaration(node)) {
				return typescript.updateClassDeclaration(
					node,
					node.decorators,
					node.modifiers,
					typescript.createIdentifier("Bar"),
					node.typeParameters,
					node.heritageClauses,
					node.members
				);
			} else if (typescript.isExportSpecifier(node)) {
				return typescript.updateExportSpecifier(node, node.propertyName, typescript.createIdentifier("Bar"));
			} else {
				return typescript.visitEachChild(node, visitNode, context);
			}
		}

		return typescript.visitEachChild(sourceFile, visitNode, context);
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
			debug: false,
			transformers: ({typescript}) => ({
				before: [transformer(typescript)],
				afterDeclarations: [transformer(typescript)]
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

test("Supports Custom Transformers, including on bundled declarations. #2", async t => {
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
			debug: false,
			transformers: ({typescript}) => ({
				after: [
					_ => sourceFile => {
						return typescript.updateSourceFileNode(sourceFile, [
							...sourceFile.statements,
							typescript.createExpressionStatement(
								typescript.createCall(typescript.createPropertyAccess(typescript.createIdentifier("console"), typescript.createIdentifier("log")), undefined, [
									typescript.createStringLiteral("foo")
								])
							)
						]);
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

test("Supports adding diagnostics from Custom Transformers. #1", async t => {
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
			debug: false,
			hook: {
				diagnostics: diagnostics => {
					hadDiagnostic = diagnostics.length > 0;
					return [];
				}
			},
			transformers: ({addDiagnostics, typescript}) => ({
				before: [
					_ => sourceFile => {
						addDiagnostics({
							code: 123,
							category: typescript.DiagnosticCategory.Error,
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
