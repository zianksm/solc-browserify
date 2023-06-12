![](https://img.shields.io/badge/using%20solc-0.8.20-blue)

# Solc Browserify

Solidity Compiler for the browser. Powered by WebWorker.

# About

This package is heavily inspired by [rexdavinci/browser-solidity-compiler](https://github.com/rexdavinci/browser-solidity-compiler).

### **Why another package?**

this package uses a different method to initialize the compiler, it uses the bundled `solc/wrapper` module provided by solc.

### **How it works**

this is accomplished by using a **dedicated web worker** and browserifying the `solc/wrapper` module, and then uploading the bundled module to npm. the worker then fetch the bundled wrapper module directly using `importScripts` from `unpkg(open-source cdn for npm)`. check the bundled module [here](https://www.npmjs.com/package/solc-wrapper-bundle).

### **Why use the bundled wrapper ?**

the [rexdavinci/browser-solidity-compiler](https://github.com/rexdavinci/browser-solidity-compiler) uses the built-in wasm `cwrap` function to initialize the compiler. although this works, the initialized compiler does not support import callbacks, which is important when you are building complex smart contracts.

by using the bundled native `solc/wrapper`, it enables custom import callbacks function. which then you can pass arbitrary but pure functions when initalizing the compiler.

but this came at a cost, because we use the bundled native `solc/wrapper`, we effectively can only wrap the same `solc` binary version as the bundled `solc/wrapper`. there is currently no effecient and easy way to bundle `solc/wrapper` on the fly. solc version will be displayed using a badge in the readme.

# Usage

## **Installation**

```bash
npm i solc-browserify
```

### using yarn

```bash
yarn add solc-browserify
```

## **Import it in your app**

```typescript
import {
  Solc,
  ImportCallbackFn,
  ImportCallbackReturnType,
} from "solc-browserify";
```

## **Create a new Compiler Instance**

```typescript
const compiler = new Solc(callback? : (Solc: Solc) => any);
```

> Note that when creating a new compiler instance, the newly created worker will fetch `solc/wrapper` bundle(~500 KB) and the `solc` binary(~8 MB).

## **Compile**

```typescript
const output = await compiler.compile(contract);
```

## **Support for Import Callback**

this package have support for passing import callback function to the compiler.
note that the import callback cannot be a closure, MUST be pure function, synchronous, and takes in exactly 1 parameter for the import path.

### **Basic example using import callback**

```typescript
import {
  Solc,
  ImportCallbackFn,
  ImportCallbackReturnType,
} from "solc-browserify";

const contract = `import "lib.sol";

contract C {

    function f() public {
         L.f();
    }
}`;

const callback: ImportCallbackFn = function (
  path: string
): ImportCallbackReturnType {
  const libSol = `library L { function f() internal returns (uint) { return 7; }`;

  let contract: ImportCallbackReturnType = null;

  if (path === "lib.sol") {
    contract = { contents: libSol };

    return contract;
  }

  contract = {
    error: `could not find source contract for ${path}`,
  };

  return contract;
};

async function main() {
  const solc = new Solc();
  const contract = await solc.compile(contract, callback);
}

main();
```

# Example

[**Here**](https://zianksm.github.io/solc-browserify-example/)
