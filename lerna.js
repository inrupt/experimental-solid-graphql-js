const { loadPackages, exec, iter } = require('lerna-script')
const checkDeps = require('depcheck')
const path = require('path');
const { readFileSync, readdirSync } = require('fs');

async function depInfo({ location, name }, log) {
  const folders = readdirSync(location, { withFileTypes: true });
  
  const { files } = JSON.parse(readFileSync(path.join(location, 'package.json'), 'utf8'));
  let ignore = files ? folders.filter(elem => files.every(file => !file.startsWith(elem.name))) : folders;
  ignore = ignore.map(x => x.isDirectory() ? `${x.name}/**` : x.name)

  const { dependencies, devDependencies, missing, using } = await checkDeps(location, { ignorePatterns: ignore }, val => val);

  return {
    unusedDeps: [...dependencies, ...devDependencies].filter(elem => !Object.keys(using).includes(elem)),
    missingDeps: Object.keys(missing),
    allDeps: Object.keys(using),
  }
}

async function depFixTask(log) {
  // Filter out Comunica engine builds
  const packages = (await (log.packages || loadPackages())).filter(package => !package.location.includes('engines') && package.location.startsWith(path.join(__dirname, '/packages')));

  await iter.forEach(packages, { log })(async pkg => {
    log.info(pkg.name)

    const { missingDeps, unusedDeps, allDeps } = await depInfo(pkg);

    if (allDeps.includes(pkg.name))
      log.error('     package is a dependency of itself')

    for (const dep of missingDeps) {
      log.info(`adding ${dep}`)
      await exec.command(pkg)(`lerna add ${dep} --scope ${pkg.name}`);
    }

    await exec.command(pkg)(`npm remove ${unusedDeps.join(' ')}`);
  })
}

module.exports.depFixTask = depFixTask
