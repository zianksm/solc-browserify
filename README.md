![](https://img.shields.io/badge/using%20solc-0.8.17-blue)

# Solc Browserify

Solidity Compiler for the browser. Powered by WebWorker.

# About

This package is heavily inspired by [rexdavinci/browser-solidity-compiler](https://github.com/rexdavinci/browser-solidity-compiler).

### **Why another package?**

this package uses a different method to initialize the compiler, it uses the bundled `solc/wrapper` module provided by solc.

### **How it works**

this is accomplished by browserifying the `solc/wrapper` module, and then uploading the bundled module to npm. the worker then fetch the bundled wrapper module directly using `importScripts` from `unkpg(open-source cdn for npm)` . check the bundled module [here](https://www.npmjs.com/package/solc-wrapper-bundle).

### **Why use the bundled wrapper ?**

the [rexdavinci/browser-solidity-compiler](https://github.com/rexdavinci/browser-solidity-compiler) uses the built-in wasm `cwrap` function to initialize the compiler. although this works, the initialized compiler does not support import callbacks, which is important when you are building complex smart contracts.

by using the bundled native `solc/wrapper`, it enables custom import callbacks function. which then you can pass arbitrary but pure functions when initalizing the compiler.

but this came at a cost, because we use the bundled native `solc/wrapper`, we effectively can only wrap the same `solc` binary version as the bundled `solc/wrapper`. there is currently no effecient and easy way to bundle `solc/wrapper` on the fly. solc version will be displayed using a badge in the readme.

# Usage

# Example

**WIP**
