import { FnString } from './browser.solidity.worker';

export class CompilerHelpers {
  public static createCompileInput = (
    contractBody: string,
    options: any = {}
  ): string => {
    const CompileInput = {
      language: 'Solidity',
      sources: {
        Compiled_Contracts: {
          content: contractBody,
        },
      },
      settings: {
        ...options,
        outputSelection: {
          '*': {
            '*': ['*'],
          },
        },
      },
    };
    return JSON.stringify(CompileInput);
  };
}

export class FnTransform {
  public static stringify(fn: any): FnString {
    const name = fn.name;

    const _fn = fn.toString();

    const args = _fn.substring(_fn.indexOf('(') + 1, _fn.indexOf(')'));

    const body = _fn.substring(_fn.indexOf('{') + 1, _fn.lastIndexOf('}'));
    return {
      name,
      args,
      body,
    };
  }
}
