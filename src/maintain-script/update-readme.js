const fs = require('fs');
const path = require('path');


async function main() {
    const solcJsonPath = path.resolve(process.cwd(), 'node_modules', 'solc', 'package.json');
    const solcJson = JSON.parse(fs.readFileSync(solcJsonPath, 'utf8'));
    const version = solcJson.version;

    const readmeContent = `# solc-wrapper-bundle
![](https://img.shields.io/badge/using%20solc-${version}-blue)


\`solc/wrapper\` bundled with browserify and babelify for browser usage. intended to be used from \`WebWorker\` by importing the contents using \`importScripts()\` from [unpkg](https://unpkg.com/).`

    fs.writeFileSync("./README.md", readmeContent);

    return;
}

main()