import { CompilerEvent, ImportCallbackFn } from "./browser.solidity.worker";
import { _version } from "./constant";
import { CompilerHelpers, FnTransform } from "./helpers";
import { _Worker } from "./worker";

export type CallbackFn = (Solc: Solc) => any;
export type CompilerOutput<T = any, U = any> = {
  contracts?: T;
  errors?: CompilerError[];
  sources?: U;
};
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
  private worker: Worker;
  callback: CallbackFn | undefined;

  /**
   * instantiate this as soon as possible so that the WebWoker can initialize the compiler
   * and is ready for compilation when needed.
   */
  constructor(callback?: CallbackFn) {
    this.callback = callback;
    this.worker = this.createCompilerWebWorker();
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
   * @param importCallback import callback function, currently does not support arrow function. only support synchronous function.
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

      this.worker.onmessage = (event: MessageEvent<CompilerEvent>) => {
        if (event.data.type === "out") {
          resolve(JSON.parse(event.data.output));
        }

        // in case of the compile method is invoked before the callback is executed.
        // usually the compile method is invoked when the compiler isn't yet initialized.
        if (event.data.type === "ready") {
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
  // TODO : build -> read the generated webworker class -> turn it into string -> save it in a file in the dist folder as string const -> import it here to use it as inline web worker
  private createCompilerWebWorker() {
    return new Worker(
      URL.createObjectURL(new Blob([`(new ${_Worker})`], { type: "module" }))
    );
  }

  private createCompilerInput(
    contract: string,
    importCallback?: ImportCallbackFn
  ) {
    const compilerInput = CompilerHelpers.createCompileInput(contract);
    const fnStr =
      importCallback !== undefined
        ? FnTransform.stringify(importCallback)
        : undefined;

    const event: CompilerEvent = {
      type: "compile",
      importCallback: fnStr,
      compilerInput,
    };

    return event;
  }
}
