import * as fs from 'fs';

async function main() {
    const workerString = fs.readFileSync("./dist/browser.solidity.worker.js").toString()
    fs.writeFileSync("./worker-gen/worker.js", workerString);
    const { Compiler } = await import("./worker.js")


    let compilerString = Compiler.toString().replaceAll("`", "\\`").replaceAll("$", "\\$")
    const codeGen = `export const _Worker =  \`${compilerString}\`;\n//# sourceMappingURL=worker.js.map`
    fs.writeFileSync("./dist/worker.js", codeGen)
}
main()