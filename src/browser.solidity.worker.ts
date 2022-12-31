declare global {
  interface Worker {
    Module: any;
    solc: any;
  }
}

type DepedenciesResponse = {
  status: boolean;
  message: string;
  data: any;
};

type CompilerEvent = {
  type: 'compile';
  compilerInput: any;
};

class Compiler {
  private readonly ctx: Worker;
  private solc: any;

  constructor() {
    this.ctx = self as any;
    this.activateCompiler();
    this.registerMessageHandler();
  }

  private activateCompiler() {
    console.log('activating compiler..');
    // TODO: tidy up code and seperate worker startup and compile
    // TODO: add error handling

    // must import the soljson binary first then the solc bundler will wrap the binary and emit a solc global window.
    // IMPORTANT : the bundler is actually just `solc/wrapper` bundled together with webpack
    // because of that, the bundler version and the binary version must match!
    importScripts('http://127.0.0.1:8000/scripts/soljson.js');
    importScripts('http://127.0.0.1:8000/scripts/solc.bundle.js');
    console.log('compiler activated');

    this.solc = this.ctx.solc;
  }

  private registerMessageHandler() {
    this.ctx.onmessage = (event: MessageEvent<CompilerEvent>) => {
      switch (event.data.type) {
        case 'compile':
          this.compile(event.data.compilerInput);
          break;

        default:
          console.log('invalid message type: ' + event.data.type);
      }
    };
  }

  private compile(input: any) {
    const compilerOutput = this.solc.compile(input, {
      import: this.resolveDeps,
    });

    this.ctx.postMessage(compilerOutput);
  }

  private resolveDeps(path: string) {
    const name = path.split('/').pop() as string;
    console.log(name);
    try {
      const api = new XMLHttpRequest();

      api.open('GET', 'https://api-staging.baliola.io/contracts/get', false);
      api.send(null);

      const dependencies: DepedenciesResponse = JSON.parse(api.response);
      console.log(dependencies.data);

      return {
        contents: dependencies.data[name],
      };
    } catch (error) {
      return {
        error: `could not find source contract for ${name}`,
      };
    }
  }
}

function browserSolidityCompiler() {
  const ctx: Worker = self as any;

  ctx.addEventListener('message', async ({ data }) => {
    if (data === 'fetch-compiler-versions') {
      fetch('https://binaries.soliditylang.org/bin/list.json')
        .then((response) => response.json())
        .then((result) => {
          postMessage(result);
        });
    } else {
      const _solc = (ctx as any).solc;
      console.log(_solc);

      function resolveDeps(path: string) {
        const name = path.split('/').pop() as string;
        console.log(name);

        const xhr = new XMLHttpRequest();

        xhr.open('GET', 'https://api-staging.baliola.io/contracts/get', false);
        xhr.send(null);

        const dependencies: DepedenciesResponse = JSON.parse(xhr.response);
        console.log(dependencies.data);

        return {
          contents: dependencies.data[name],
        };
      }

      const output = JSON.parse(
        _solc.compile(data.input, { import: resolveDeps })
      );

      postMessage(output);
    }
  });
}

function importScripts(_arg0: string) {
  throw new Error('Function not implemented.');
}

if (window !== self) {
  browserSolidityCompiler();
}

export { browserSolidityCompiler, Compiler, CompilerEvent };
