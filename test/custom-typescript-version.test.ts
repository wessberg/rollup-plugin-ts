import test from "ava";
import {formatCode} from "./util/format-code";
import {generateRollupBundle} from "./setup/setup-rollup";

import * as TS301 from "typescript-3-0-1";
import * as TS311 from "typescript-3-1-1";
import * as TS321 from "typescript-3-2-1";
import * as TS331 from "typescript-3-3-1";
import * as TS341 from "typescript-3-4-1";
import * as TS351 from "typescript-3-5-1";
import * as TS362 from "typescript-3-6-2";
import * as TS372 from "typescript-3-7-2";

test("Supports multiple TypeScript versions. #1", async t => {
	for (const [TS, version] of [
		[TS301, "v3.0.1"],
		[TS311, "v3.1.1"],
		[TS321, "v3.2.1"],
		[TS331, "v3.3.1"],
		[TS341, "v3.4.1"],
		[TS351, "v3.5.1"],
		[TS362, "v3.6.2"],
		[TS372, "v3.7.2"]
	]) {
		const bundle = await generateRollupBundle(
			[
				{
					entry: true,
					fileName: "index.ts",
					text: `\
				export * from "./default/try-catch";
			`
				},
				{
					entry: false,
					fileName: "default/try-catch.ts",
					text: `\
				import { Action } from "../action/action";
				import { DefaultAsyncActionCreatorWithMeta } from "./default-async-action-creator";
				export const tryCatchDispatch = (dispatch: ((action: Action) => void)) =>
					async <Success, Meta> (actionCreator: DefaultAsyncActionCreatorWithMeta<Success, Meta>) => {
				};
			`
				},
				{
					entry: false,
					fileName: "action/action.ts",
					text: `\
				export type ActionIdType = string;
				export type DefaultActionPayloadType = void;
				export type DefaultActionMetaType = void;
				export enum ActionStatusKind {
					START = "START",
					SUCCESS = "SUCCESS",
					FAILURE = "FAILURE"
				}

				export type Action<Payload = unknown, Meta = unknown> = {
					type: string;
					id: ActionIdType;
					status: ActionStatusKind;
					payload: Payload;
					meta: Meta;
					error: boolean;
				}

			`
				},
				{
					entry: false,
					fileName: "action/action-creator.ts",
					text: `\
				import { Action, ActionIdType, ActionStatusKind, DefaultActionMetaType, DefaultActionPayloadType } from "./action";
				type P = DefaultActionPayloadType;
				type M = DefaultActionMetaType;

				export type OptionalSpreadTuple<T, U> = U extends void ? (T extends void ? [T?, U?] : [T, U?]) : [T, U];
				export type OptionalSpreadTupleAlwaysOptional<T, U> = T extends void ? [T?, U?] : [T, U?];
				
				export interface ActionCreatorBase<Payload, Meta> {
					id: ActionIdType;
					status: ActionStatusKind;
				}
				
				export interface ActionCreatorWithMeta<Payload = P, Meta = M> extends ActionCreatorBase<Payload, Meta> {
					meta: Meta;
					(...args: OptionalSpreadTupleAlwaysOptional<Payload, Meta>): Action<Payload, Meta>;
				}
			`
				},
				{
					entry: false,
					fileName: "default/default-async-action-creator.ts",
					text: `\
				import { ActionIdType, DefaultActionMetaType, DefaultActionPayloadType } from "../action/action";
				import { ActionCreatorWithMeta } from "../action/action-creator";
				type P = DefaultActionPayloadType;
				type M = DefaultActionMetaType;

				export interface AsyncActionCreatorBase<Start, Success, Failure, Meta> {
					id: ActionIdType;
				}

				export interface AsyncActionCreatorWithMeta<Start = P, Success = P, Failure = P, Meta = M> extends AsyncActionCreatorBase<Start, Success, Failure, Meta> {
					meta: Meta;
					start: ActionCreatorWithMeta<Start, Meta>;
					success: ActionCreatorWithMeta<Success, Meta>;
					failure: ActionCreatorWithMeta<Failure, Meta>;
				}
				
				export type DefaultAsyncActionCreatorWithMeta<Success = DefaultActionPayloadType, Meta = DefaultActionMetaType> = AsyncActionCreatorWithMeta<void, Success, Error, Meta> & {foo: string};
			`
				}
			],
			{
				debug: false,
				typescript: (TS as unknown) as typeof import("typescript")
			}
		);
		const {
			declarations: [file]
		} = bundle;

		t.deepEqual(
			formatCode(file.code),
			formatCode(`\
			type ActionIdType = string;
			type DefaultActionPayloadType = void;
			type DefaultActionMetaType = void;
			declare enum ActionStatusKind {
					START = "START",
					SUCCESS = "SUCCESS",
					FAILURE = "FAILURE"
			}
			type Action<Payload = unknown, Meta = unknown> = {
					type: string;
					id: ActionIdType;
					status: ActionStatusKind;
					payload: Payload;
					meta: Meta;
					error: boolean;
			};
			type P = DefaultActionPayloadType;
			type M = DefaultActionMetaType;
			type OptionalSpreadTupleAlwaysOptional<T, U> = T extends void ? [T?, U?] : [T, U?];
			interface ActionCreatorBase<Payload, Meta> {
					id: ActionIdType;
					status: ActionStatusKind;
			}
			interface ActionCreatorWithMeta<Payload = P, Meta = M> extends ActionCreatorBase<Payload, Meta> {
					meta: Meta;
					(...args: OptionalSpreadTupleAlwaysOptional<Payload, Meta>): Action<Payload, Meta>;
			}
			type P$0 = DefaultActionPayloadType;
			type M$0 = DefaultActionMetaType;
			interface AsyncActionCreatorBase<Start, Success, Failure, Meta> {
					id: ActionIdType;
			}
			interface AsyncActionCreatorWithMeta<Start = P$0, Success = P$0, Failure = P$0, Meta = M$0> extends AsyncActionCreatorBase<Start, Success, Failure, Meta> {
					meta: Meta;
					start: ActionCreatorWithMeta<Start, Meta>;
					success: ActionCreatorWithMeta<Success, Meta>;
					failure: ActionCreatorWithMeta<Failure, Meta>;
			}
			type DefaultAsyncActionCreatorWithMeta<Success = DefaultActionPayloadType, Meta = DefaultActionMetaType> = AsyncActionCreatorWithMeta<void, Success, Error, Meta> & {
					foo: string;
			};
			declare const tryCatchDispatch: (dispatch: (action: Action<unknown, unknown>) => void) => <Success, Meta>(actionCreator: DefaultAsyncActionCreatorWithMeta<Success, Meta>) => Promise<void>;
			export { tryCatchDispatch };
		`),
			`Did not produce correct output for TypeScript ${version}`
		);
	}
});
