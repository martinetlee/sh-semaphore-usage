download = require("download");
fs = require("fs");
packageJson = require("../package.json");

async function main() {

    let config = packageJson.config;
    
    const snarkArtifactsPath = config.paths.build["snark-artifacts"]
    const url = `http://www.trusted-setup-pse.org/semaphore/${20}`

    if (!fs.existsSync(snarkArtifactsPath)) {
        fs.mkdirSync(snarkArtifactsPath, { recursive: true })
    }

    if (!fs.existsSync(`${snarkArtifactsPath}/semaphore.zkey`)) {
        await download(`${url}/semaphore.wasm`, snarkArtifactsPath)
        await download(`${url}/semaphore.zkey`, snarkArtifactsPath)
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })