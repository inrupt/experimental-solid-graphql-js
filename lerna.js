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

async function depCheckTask(log) {
  // Filter out Comunica engine builds
  const packages = (await (log.packages || loadPackages())).filter(package => !package.location.includes('engines') && package.location.startsWith(path.join(__dirname, '/packages')));
  const resolutions = Object.keys(JSON.parse(readFileSync(path.join(__dirname, 'package.json'), 'utf8')).resolutions ?? {});

  return iter.forEach(packages, { log })(async package => {
    const { missingDeps, unusedDeps, allDeps } = await depInfo(package)

    if (missingDeps.length > 0) {
      throw new Error(`Missing dependencies:  ${missingDeps.join(', ')} from ${package.name}`);
    }

    if (unusedDeps.length > 0) {
      throw new Error(`Extra dependencies: ${unusedDeps.join(', ')} in ${package.name}`);
    }

    if (allDeps.includes(package.name))
      throw new Error(`${package.name} is a dependency of itself`);


    // Now check all resolutions use a star ("*") import
    const packageJson = JSON.parse(readFileSync(path.join(package.location, 'package.json'), 'utf8'));
    for (const dep of Object.keys(packageJson.dependencies ?? {})) {
      if (resolutions.includes(dep) && packageJson.dependencies[dep] !== '*') {
        throw new Error(`Resolution not using \'*\' import for ${dep} in ${package.name}`);
      }
    }
  })
}

module.exports.depCheckTask = depCheckTask
