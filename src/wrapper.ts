import {
  Compiler,
  CompilerEvent,
  ImportCallbackFn,
} from './browser.solidity.worker';
import { _version } from './constant';
import { CompilerHelpers, FnTransform } from './helpers';

/**
 * instantiate this as soon as possible so that the WebWoker can initialize the compiler
 * and is ready for compilation when needed.
 */
export class Solc {
  private worker: Worker;

  /**
   * instantiate this as soon as possible so that the WebWoker can initialize the compiler
   * and is ready for compilation when needed.
   */
  constructor() {
    this.worker = this.createCompilerWebWorker();
    this.initWorker();
  }

  private initWorker() {
    const event: CompilerEvent = {
      type: 'init',
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
  ): Promise<any> {
    return new Promise((resolve, reject) => {
      const message = this.createCompilerInput(contract, importCallback);

      this.worker.postMessage(message);

      this.worker.onmessage = (event) => {
        resolve(JSON.parse(event.data));
      };

      this.worker.onerror = (err) => {
        reject(err);
      };
    });
  }

  private createCompilerWebWorker() {
    return new Worker(
      URL.createObjectURL(new Blob([`(new ${Compiler})`], { type: 'module' }))
    );
  }

  private createCompilerInput(
    contract: string,
    importCallback?: ImportCallbackFn
  ) {
    const compilerInput = CompilerHelpers.createCompileInput(contract);
    const fnStr = FnTransform.stringify(importCallback);

    const event: CompilerEvent = {
      type: 'compile',
      importCallback: fnStr,
      compilerInput,
    };

    return event;
  }
}
