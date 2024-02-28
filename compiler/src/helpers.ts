import { FnString } from "./compiler";
import * as Dispatch from "./dispatch";
export type Optimizer = Dispatch.Compiler.Interface.Input.Optimizer;
export type CompilerInput = Dispatch.Compiler.Interface.Input.CompilerInput;

export class CompilerHelpers {
  public static createCompileInput = (
    contractBody: string,
    optimizer: Optimizer = Dispatch.Compiler.Interface.Input.DEFAULT_OPTIMIZER,
    options: any = {},
    outputSelection: any = {}
  ): CompilerInput => {
    const input: Dispatch.Compiler.Interface.Input.CompilerInput = {
      language: "Solidity",
      sources: {
        contract: {
          content: contractBody,
        },
      },
      settings: {
        optimizer,
        ...options,
      },
      outputSelection,
    };

    return input;
  };
}
export class FnTransform {
  public static stringify(fn: any): Dispatch.Compiler.CallbackFunctionFragment {
    const name = fn.name;

    const _fn = fn.toString();

    const args = _fn.substring(_fn.indexOf("(") + 1, _fn.indexOf(")"));

    const body = _fn.substring(_fn.indexOf("{") + 1, _fn.lastIndexOf("}"));
    return {
      name,
      args,
      body,
    };
  }
}
