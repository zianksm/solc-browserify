import EventEmitter from "events";
import { SupportedVersion } from "./constant";
import * as Dispatch from "./dispatch";
// worker cannot import modules directly using require or import statements. because we activate the worker using inline blob method.
// worker should use imporScripts instead.
declare global {
  interface Worker {
    Module: any;
    solc: any;
    wrapper: any;
  }
}

export type FnString = {
  name: string;
  args: string;
  body: string;
};

type ImportCallbackReturnType = { contents: string } | { error: string };
type ImportCallbackFn = (path: string) => ImportCallbackReturnType;

type GetVersionResponse = {
  builds: any[];
  releases: any;
  latestRelease: string;
};

class CompilerBus {
  private readonly emitter: EventEmitter;

  constructor() {
    this.emitter = new EventEmitter();
  }

  public onReady(listener: () => void) {
    this.emitter.on("ready", listener);
  }

  public ready() {
    this.emitter.emit("ready");
  }

  public onOutput(
    listener: (payload: Dispatch.Compiler.Dispatchable.OutDispatch) => void
  ) {
    this.emitter.on("output", listener);
  }

  public output(payload: Dispatch.Compiler.Dispatchable.OutDispatch) {
    this.emitter.emit("output", payload);
  }
}
class Compilers {
  private readonly emitter: EventEmitter;
  private compilers: Map<
    SupportedVersion,
    { compiler: Compiler; bus: CompilerBus }
  >;

  constructor() {
    this.emitter = new EventEmitter();
    this.compilers = new Map();
  }

  public getOrInit(version: SupportedVersion): Promise<Compiler> {
    if (this.compilers.has(version)) {
      return Promise.resolve(this.compilers.get(version)!.compiler);
    }

    const bus = new CompilerBus();

    bus.onReady(() => {
      this.emitter.emit("ready", version);
    });

    bus.onOutput((payload) => {
      this.emitter.emit("output", payload, version);
    });

    const compiler = new Compiler(bus);
    this.compilers.set(version, { compiler, bus });
    // return a promise since initializing a compiler might take a while
    return new Promise((resolve) => {
      compiler.init(version);
      resolve(compiler);
    });
  }

  public onReady(listener: (version: SupportedVersion) => void) {
    this.emitter.on("ready", listener);
  }

  public onOutput(
    listener: (
      payload: Dispatch.Compiler.Dispatchable.OutDispatch,
      version: SupportedVersion
    ) => void
  ) {
    this.emitter.on("output", listener);
  }
}

class Compiler {
  private readonly ctx: Worker;
  private solc: any;
  private version: undefined | SupportedVersion;
  private messagePipe: CompilerBus;

  constructor(pipe: CompilerBus) {
    this.ctx = self as any;
    this.messagePipe = pipe;
  }

  public init(version: SupportedVersion) {
    this.version = version;
    const buildVersion = this.getVersionScript();

    // TODO: add error handling

    // must import the soljson binary first then the solc bundler will wrap the binary and emit a solc global window.
    // IMPORTANT : the bundler is actually just `solc/wrapper` bundled together with browserify
    // because of that, the bundler version and the binary version must match!

    // will emit global `Module`
    importScripts(`https://binaries.soliditylang.org/bin/${buildVersion}`);
    // will emit global `wrapper`
    importScripts(this.bundleUrl());
    const wrapper = this.ctx.wrapper;
    const module = this.ctx.Module;

    this.solc = wrapper(module);
    this.ready();
  }

  private ready() {
    this.messagePipe.ready();
  }

  private bundleUrl() {
    return `https://unpkg.com/solc-wrapper-bundle@${this.version}/dist/bundle.js`;
  }
  private getVersionScript() {
    const api = new XMLHttpRequest();
    api.open("GET", "https://binaries.soliditylang.org/bin/list.json", false);
    api.send(null);

    const response: GetVersionResponse = JSON.parse(api.response);

    return response.releases[this.version!];
  }

  public compile(
    input: Dispatch.Compiler.Interface.Input.CompilerInput,
    fn?: FnString
  ) {
    let output;

    if (fn === undefined) {
      output = this.solc.compile(input);
    } else {
      const callback = this.constructFn(fn);

      output = this.solc.compile(input, { import: callback });
    }

    this.messagePipe.output(output);
  }

  private constructFn(fn: FnString) {
    return new Function(fn.args, fn.body);
  }
}

// function placeholder for typescript
function importScripts(_arg0: string) {
  throw new Error("Function not implemented.");
}

export { Compiler, ImportCallbackFn, ImportCallbackReturnType };

let compiler: Compilers | undefined;

function getCompilers() {
  if (compiler === undefined) {
    compiler = new Compilers();

    compiler.onOutput((payload, version) => {
      self.postMessage(payload, version);
    });

    compiler.onReady((version) => {
      self.postMessage("ready", version);
    });
  }

  return compiler;
}

self.onconnect = (_) => {
  getCompilers();
};

self.onmessage = (
  event: MessageEvent<Dispatch.Compiler.Dispatchable.CompilerDispatchMessage>
) => {
  const raw = event.data;

  switch (raw.action) {
    case "init": {
      const version = raw.version;
      const compilers = getCompilers();
      compilers.getOrInit(version);
      break;
    }

    case "compile": {
      const input = raw.compilerInput;
      const version = raw.version;
      const compilers = getCompilers();
      compilers
        .getOrInit(version)
        .then((compiler) => compiler.compile(input, raw.importCallback));
      break;
    }
  }
};
