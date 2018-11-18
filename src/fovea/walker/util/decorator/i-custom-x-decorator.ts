import {Decorator} from "typescript";
import {FoveaDecoratorCustomHostName} from "../../../constant/constant";

export interface ICustomXDecorator {
	decorator: Decorator;
	x: FoveaDecoratorCustomHostName;
}