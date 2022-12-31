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

type CompilerEvent =
  | {
      type: 'compile';
      compilerInput: any;
    }
  | {
      type: 'init';
      version: Version;
    };

type Version = {
  default: string;
};

type GetVersionResponse = {
  builds: any[];
  releases: any;
  latestRelease: string;
};

class Compiler {
  private readonly ctx: Worker;
  private solc: any;

  constructor() {
    this.ctx = self as any;
    this.registerMessageHandler();
  }

  private init(version: Version) {
    console.log('initializing compiler..');
    const buildVersion = this.getVersionScript(version);
    console.log(buildVersion);

    // TODO: tidy up code and seperate worker startup and compile
    // TODO: add error handling

    // must import the soljson binary first then the solc bundler will wrap the binary and emit a solc global window.
    // IMPORTANT : the bundler is actually just `solc/wrapper` bundled together with browserify
    // because of that, the bundler version and the binary version must match!

    // TODO : change the importScripts url to production api url
    importScripts(`https://binaries.soliditylang.org/bin/${buildVersion}`);
    importScripts('http://127.0.0.1:8000/scripts/solc.bundle.js');
    console.log('compiler initialized');

    this.solc = this.ctx.solc;
  }

  private getVersionScript(version: Version) {
    const api = new XMLHttpRequest();
    api.open('GET', 'https://binaries.soliditylang.org/bin/list.json', false);
    api.send(null);

    const response: GetVersionResponse = JSON.parse(api.response);

    return response.releases[version.default];
  }

  private registerMessageHandler() {
    this.ctx.onmessage = (event: MessageEvent<CompilerEvent>) => {
      switch (event.data.type) {
        case 'compile':
          this.compile(event.data.compilerInput);
          break;

        case 'init':
          this.init(event.data.version);
          break;

        default:
          console.log('invalid message type: ' + event.data);
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
    try {
      const api = new XMLHttpRequest();

      api.open('GET', 'https://api-staging.baliola.io/contracts/get', false);
      api.send(null);

      const dependencies: DepedenciesResponse = JSON.parse(api.response);

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

// function placeholder for typescript
function importScripts(_arg0: string) {
  throw new Error('Function not implemented.');
}

export { Compiler, CompilerEvent, Version as version };
