class Compiler {
    ctx;
    solc;
    constructor() {
        this.ctx = self;
        this.registerMessageHandler();
    }
    init(version) {
        const buildVersion = this.getVersionScript(version);
        // TODO: add error handling
        // must import the soljson binary first then the solc bundler will wrap the binary and emit a solc global window.
        // IMPORTANT : the bundler is actually just `solc/wrapper` bundled together with browserify
        // because of that, the bundler version and the binary version must match!
        // will emit global `Module`
        importScripts(`https://binaries.soliditylang.org/bin/${buildVersion}`);
        // will emit global `wrapper`
        importScripts("https://unpkg.com/solc-wrapper-bundle@latest/dist/bundle.js");
        const wrapper = this.ctx.wrapper;
        const module = this.ctx.Module;
        this.solc = wrapper(module);
        this.ready();
    }
    ready() {
        const event = {
            type: "ready",
            status: true,
        };
        this.ctx.postMessage(event);
    }
    getVersionScript(version) {
        const api = new XMLHttpRequest();
        api.open("GET", "https://binaries.soliditylang.org/bin/list.json", false);
        api.send(null);
        const response = JSON.parse(api.response);
        return response.releases[version.default];
    }
    registerMessageHandler() {
        this.ctx.onmessage = (event) => {
            switch (event.data.type) {
                case "compile":
                    this.compile(event.data.compilerInput, event.data.importCallback);
                    break;
                case "init":
                    this.init(event.data.version);
                    break;
                default:
                    console.log("invalid message type: " + event.data);
            }
        };
    }
    compile(input, fn) {
        let output;
        if (fn === undefined) {
            output = this.solc.compile(input);
        }
        else {
            const callback = this.constructFn(fn);
            output = this.solc.compile(input, { import: callback });
        }
        const event = { type: "out", output };
        this.ctx.postMessage(event);
    }
    constructFn(fn) {
        return new Function(fn.args, fn.body);
    }
}
// function placeholder for typescript
function importScripts(_arg0) {
    throw new Error("Function not implemented.");
}
export { Compiler, };
//# sourceMappingURL=browser.solidity.worker.js.map