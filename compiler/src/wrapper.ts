import { ImportCallbackFn } from "./compiler";
import { SupportedVersion, _version } from "./constant";
import {
  CompilerHelpers,
  FnTransform,
  Optimizer,
  CompilerInput,
} from "./helpers";
import { _Worker } from "./worker";

import * as Dispatch from "./dispatch";

export type CallbackFn = (Solc: Solc) => any;
export type CompilerOutput = Dispatch.Compiler.Interface.Output.CompilerOutput;
export type CompilerError = {
  component: string;
  errorCode: string;
  formattedMessage: string;
  message: string;
  severity: string;
  sourceLocation: SourceLocation;
  type: string;
};

export type SourceLocation = {
  end: number;
  file: string;
  start: number;
};

/**
 * instantiate this as soon as possible so that the WebWoker can initialize the compiler
 * and is ready for compilation when needed.
 */
export class Solc {
  private version: SupportedVersion;
  private worker: Worker;
  callback: CallbackFn | undefined;

  constructor(callback?: CallbackFn, version: SupportedVersion) {
    this.callback = callback;
    this.worker = this.createCompilerWebWorker();
    this.version = version;
    this.onready();
    this.initWorker();
  }

  private onready() {
    this.worker.onmessage = (_event) => {
      const event: CompilerEvent = _event.data as any;

      if (this.callback === undefined) {
        return;
      }

      if (event.type === "ready") {
        this.callback(this);
      }
    };
  }

  private initWorker() {
    const event: CompilerEvent = {
      type: "init",
      version: _version,
    };

    this.worker.postMessage(event);
  }
  /**
   *
   * @param contract contract body
   * @param importCallback import callback function, currently does not support arrow function and closures. only support synchronous function.
   * ```javascript
   * // this is not supported
   * const resolveDeps = (path) =>{
   * // ... some code
   * }
   *
   * // this is supported
   * function resolveDeps(path) {
   * // ... some code
   * }
   *
   * // this is supported
   * const resolveDeps = function (path) =>{
   * // ... some code
   * }
   * ```
   */
  public async compile(
    contract: string,
    importCallback?: ImportCallbackFn
  ): Promise<CompilerOutput> {
    return new Promise((resolve, reject) => {
      const message = this.createCompilerInput(contract, importCallback);

      this.worker.postMessage(message);

      this.worker.onmessage = (
        event: MessageEvent<Dispatch.Compiler.Dispatchable.CompilerDispatchMessage>
      ) => {
        if (event.data.action === "out") {
          resolve(event.data.output);
        }

        // in case of the compile method is invoked before the callback is executed.
        // usually the compile method is invoked when the compiler isn't yet initialized.
        if (event.data.action === "ready") {
          if (this.callback !== undefined) {
            this.callback(this);
          }
        }
      };

      this.worker.onerror = (err) => {
        reject(err);
      };
    });
  }

  private createCompilerWebWorker() {
    return new SharedWorker(
      /* webpackChunkName: "solidity-compilers" */ new URL(
        "./compiler.js",
        import.meta.url
      )
    );
  }

  private createCompilerInput(
    contract: string,
    importCallback?: ImportCallbackFn,
    optimizer?: Optimizer,
    options?: any,
    outputSelection?: any
  ) {
    const compilerInput = CompilerHelpers.createCompileInput(
      contract,
      optimizer,
      options,
      outputSelection
    );

    const fnStr =
      importCallback !== undefined
        ? FnTransform.stringify(importCallback)
        : undefined;

    const event: Dispatch.Compiler.Dispatchable.CompileDispatch = {
      action: "compile",
      importCallback: fnStr,
      compilerInput,
      version: this.version,
    };

    return event;
  }
}
