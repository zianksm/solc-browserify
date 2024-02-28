import { ImportCallbackFn } from "./compiler";
import { SupportedVersion, _version } from "./constant";
import { CompilerHelpers, FnTransform, Optimizer } from "./helpers";
import { _Worker } from "./worker";
import * as Dispatch from "./dispatch";

export type CallbackFn = (Solc: Solc) => any;
export type CompilerOutput = Dispatch.Compiler.Interface.Output.CompilerOutput;

// worker global scope stuff to satisfy the compiler
declare global {
  interface SharedWorkerGlobalScope {}
}

/**
 * instantiate this as soon as possible so that the WebWoker can initialize the compiler
 * and is ready for compilation when needed.
 */
export class Solc {
  private version: SupportedVersion;
  private __worker: SharedWorker; // eslint-disable-line @typescript-eslint/no-unused-vars
  private worker: MessagePort;
  callback: CallbackFn | undefined;

  constructor(version: SupportedVersion, readyCallback?: CallbackFn) {
    this.callback = readyCallback;
    const { worker, port } = this.createCompilerWebWorker();
    this.__worker = worker;
    this.worker = port;
    this.version = version;
    this.onready();
    this.initWorker();

    this.____eslint_hack_dont_call_this_plz();
  }

  private onready() {
    this.worker.onmessage = (
      event: MessageEvent<Dispatch.Compiler.Dispatchable.CompilerDispatchMessage>
    ) => {
      if (this.callback === undefined) {
        return;
      }

      if (event.data.action === "ready" && event.data.status === true) {
        this.callback(this);
      }
    };
  }

  private ____eslint_hack_dont_call_this_plz() {
    this.__worker;
  }

  private initWorker() {}
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
    return new Promise((resolve) => {
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
    });
  }

  private createCompilerWebWorker() {
    const worker = new SharedWorker(
      /* webpackChunkName: "solidity-compilers" */ new URL(
        "./compiler.js",
        import.meta.url
      )
    );

    const port = worker.port;
    port.start();

    return {
      worker,
      port,
    };
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
