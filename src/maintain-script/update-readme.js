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

    updatePackageJsonVersion(version);

    return;
}

function updatePackageJsonVersion(version) {
    const packageJsonPath = path.resolve(process.cwd(), 'package.json');
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    packageJson.version = version.toString();

    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
}

main()