import {
  Compiler,
  CompilerEvent,
  browserSolidityCompiler,
} from './browser.solidity.worker';
import { CompilerHelpers, createCompileInput } from './helpers';

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
        resolve(event.data);
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

// --------------------------------------------------------
const worker = new Worker(
  URL.createObjectURL(new Blob([`(new ${Compiler})`], { type: 'module' }))
);

export const solidityCompiler = async ({
  version,
  contractBody,
  options,
}: {
  version: string;
  contractBody: string;
  options?: { optimizer?: { enabled: boolean; runs: number } };
}) => {
  const input = createCompileInput(contractBody, options);
  return new Promise((resolve, reject) => {
    worker.postMessage({ input, version });
    worker.onmessage = function ({ data }) {
      resolve(data);
    };
    worker.onerror = reject;
  });
};

export const getCompilerVersions = async () => {
  return new Promise((resolve, reject) => {
    worker.postMessage('fetch-compiler-versions');
    worker.onmessage = function ({ data }) {
      resolve(data);
    };
    worker.onerror = reject;
  });
};
