import { Compiler, CompilerEvent } from './browser.solidity.worker';
import { CompilerHelpers } from './helpers';

// TODO : make param for import callback
/**
 * instantiate this as soon as possible so that the WebWoker can initialize the compiler
 * and is ready for compilation when needed.
 */
export class CustomBrowserSolidityCompiler {
  private worker: Worker;

  /**
   * instantiate this as soon as possible so that the WebWoker can initialize the compiler
   * and is ready for compilation when needed.
   */
  constructor() {
    this.worker = this.createCompilerWebWorker();
  }

  public async compile(contract: string): Promise<any> {
    return new Promise((resolve, reject) => {
      const message = this.createCompilerInput(contract);

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

  private createCompilerInput(contract: string) {
    const input = CompilerHelpers.createCompileInput(contract);
    const event: CompilerEvent = {
      type: 'compile',
      compilerInput: input,
    };

    return event;
  }
}