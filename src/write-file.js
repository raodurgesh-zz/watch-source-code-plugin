import fs from 'fs';
import {createHash} from 'crypto';
import path from 'path';
import _ from 'lodash';
import mkdirp from 'mkdirp';
import chalk from 'chalk';
import moment from 'moment';
import filesize from 'filesize';
import createDebug from 'debug';
import util  from 'util';

const readdir = util.promisify(fs.readdir);
const unlink = util.promisify(fs.unlink);


const debug = createDebug('write-file-webpack-plugin');


 async function RemoveFile(directory) {
  try {
    const files = await readdir(directory);
    const unlinkPromises = files.filter(filename => filename.indexOf('hot-update') !== -1).map(filename => unlink(`${directory}/${filename}`));
    return await Promise.all(unlinkPromises);
  } catch(err) {
    console.log(err);
  }
}

const isMemoryFileSystem = (outputFileSystem) => {
  return outputFileSystem.constructor.name === 'MemoryFileSystem';
};

export default function WriteFileWebpackPlugin (userOptions) {
  const options = _.assign({}, {
    exitOnErrors: true,
    force: false,
    log: true,
    test: null,
    useHashIndex: true,
    publicPath : '/'
  }, userOptions);

  if (!_.isBoolean(options.exitOnErrors)) {
    throw new TypeError('options.exitOnErrors value must be of boolean type.');
  }

  if (!_.isBoolean(options.force)) {
    throw new TypeError('options.force value must be of boolean type.');
  }

  if (!_.isBoolean(options.log)) {
    throw new TypeError('options.log value must be of boolean type.');
  }

  if (!_.isNull(options.test) && !(_.isRegExp(options.test) || _.isFunction(options.test))) {
    throw new TypeError('options.test value must be an instance of RegExp or Function.');
  }

  if (!_.isBoolean(options.useHashIndex)) {
    throw new TypeError('options.useHashIndex value must be of boolean type.');
  }

  const log = (...append) => {
    if (!options.log) {
      return;
    }

    debug(chalk.dim('[' + moment().format('HH:mm:ss') + ']'), ...append);
  };

  const assetSourceHashIndex = {};

  log('options', options);

  const apply = (compiler) => {
    let outputPath;
    let setupDone;
    let setupStatus;

    const setup = () => {
      if (setupDone) {
        return setupStatus;
      }

      setupDone = true;

      log('compiler.outputFileSystem is "' + chalk.cyan(compiler.outputFileSystem.constructor.name) + '".');

      if (!isMemoryFileSystem(compiler.outputFileSystem) && !options.force) {
        return false;
      }

      outputPath = options.publicPath;

      log('outputPath is "' + chalk.cyan(outputPath) + '".');

      setupStatus = true;

      return setupStatus;
    };

    const handleAfterEmit = (compilation, callback) => {
      if (!setup()) {
        callback();

        return;
      }

      if (options.exitOnErrors && compilation.errors.length) {
        callback();

        return;
      }

      log('compilation.errors.length is "' + chalk.cyan(compilation.errors.length) + '".');

      _.forEach(compilation.assets, (asset, assetPath) => {
        const outputFilePath = path.isAbsolute(assetPath) ? assetPath : path.join(outputPath, assetPath);
        const relativeOutputPath = path.relative(process.cwd(), outputFilePath);
        const targetDefinition = 'asset: ' + chalk.cyan('./' + assetPath) + '; destination: ' + chalk.cyan('./' + relativeOutputPath);

        const test = options.test;

        if (test) {
          const skip = _.isRegExp(test) ? !test.test(assetPath) : !test(assetPath);

          if (skip) {
            log(targetDefinition, chalk.yellow('[skipped; does not match test]'));

            return;
          }
        }

        const assetSize = asset.size();
        const assetSource = Array.isArray(asset.source()) ? asset.source().join('\n') : asset.source();

        if (options.useHashIndex) {
          const assetSourceHash = createHash('sha256').update(assetSource).digest('hex');

          if (assetSourceHashIndex[relativeOutputPath] && assetSourceHashIndex[relativeOutputPath] === assetSourceHash) {
            log(targetDefinition, chalk.yellow('[skipped; matched hash index]'));

            return;
          }

          assetSourceHashIndex[relativeOutputPath] = assetSourceHash;
        }

        const dirName = path.dirname(relativeOutputPath);

         
         RemoveFile(dirName)

        setTimeout(()=> mkdirp.sync(dirName),10)

        try {
          fs.writeFileSync(relativeOutputPath.split('?')[0], assetSource);
          log(targetDefinition, chalk.green('[written]'), chalk.magenta('(' + filesize(assetSize) + ')'));
        } catch (error) {
          log(targetDefinition, chalk.bold.red('[is not written]'), chalk.magenta('(' + filesize(assetSize) + ')'));
          log(chalk.bold.bgRed('Exception:'), chalk.bold.red(error.message));
        }
      });
      // eslint-disable-next-line promise/prefer-await-to-callbacks
      callback();
    };

    if (compiler.hooks) {
      compiler.hooks.afterEmit.tapAsync('write-file-webpack-plugin', handleAfterEmit);
    } else {
      compiler.plugin('after-emit', handleAfterEmit);
    }
  };

  return {
    apply
  };
}