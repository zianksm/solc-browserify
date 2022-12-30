declare global {
  interface Worker {
    Module: any;
  }
}

type DepedenciesResponse = {
  status: boolean;
  message: string;
  data: any;
};
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
      importScripts(data.version);
      const soljson = ctx.Module;

      const resolveDeps = async (path: string) => {
        const name = path.split('/').pop() as string;
        console.log(name);

        const api = await fetch('https://api-staging.baliola.io/contracts/get');

        const dependencies: DepedenciesResponse = await api.json();
        console.log(dependencies.data[name]);

        return {
          contents: dependencies.data[name],
        };
      };

      if ('_solidity_compile' in soljson) {
        console.log(soljson);

        const compile = soljson.cwrap('solidity_compile', 'string', [
          'string',
          'number',
        ]);

        console.log(compile);

        const output = JSON.parse(compile(data.input, { import: resolveDeps }));
        postMessage(output);
      }
    }
  });
}

function importScripts(_arg0: string) {
  throw new Error('Function not implemented.');
}

if (window !== self) {
  browserSolidityCompiler();
}

export { browserSolidityCompiler };
