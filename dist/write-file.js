'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var RemoveFile = function () {
  var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(directory) {
    var files, unlinkPromises;
    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            _context.prev = 0;
            _context.next = 3;
            return readdir(directory);

          case 3:
            files = _context.sent;
            unlinkPromises = files.filter(function (filename) {
              return filename.indexOf('hot-update') !== -1;
            }).map(function (filename) {
              return unlink(`${directory}/${filename}`);
            });
            _context.next = 7;
            return Promise.all(unlinkPromises);

          case 7:
            return _context.abrupt('return', _context.sent);

          case 10:
            _context.prev = 10;
            _context.t0 = _context['catch'](0);

            console.log(_context.t0);

          case 13:
          case 'end':
            return _context.stop();
        }
      }
    }, _callee, this, [[0, 10]]);
  }));

  return function RemoveFile(_x) {
    return _ref.apply(this, arguments);
  };
}();

exports.default = WriteFileWebpackPlugin;

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _crypto = require('crypto');

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _mkdirp = require('mkdirp');

var _mkdirp2 = _interopRequireDefault(_mkdirp);

var _chalk = require('chalk');

var _chalk2 = _interopRequireDefault(_chalk);

var _moment = require('moment');

var _moment2 = _interopRequireDefault(_moment);

var _filesize = require('filesize');

var _filesize2 = _interopRequireDefault(_filesize);

var _debug = require('debug');

var _debug2 = _interopRequireDefault(_debug);

var _util = require('util');

var _util2 = _interopRequireDefault(_util);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

var readdir = _util2.default.promisify(_fs2.default.readdir);
var unlink = _util2.default.promisify(_fs2.default.unlink);

var debug = (0, _debug2.default)('write-file-webpack-plugin');

var isMemoryFileSystem = function isMemoryFileSystem(outputFileSystem) {
  return outputFileSystem.constructor.name === 'MemoryFileSystem';
};

function WriteFileWebpackPlugin(userOptions) {
  var options = _lodash2.default.assign({}, {
    exitOnErrors: true,
    force: false,
    log: true,
    test: null,
    useHashIndex: true,
    publicPath: '/'
  }, userOptions);

  if (!_lodash2.default.isBoolean(options.exitOnErrors)) {
    throw new TypeError('options.exitOnErrors value must be of boolean type.');
  }

  if (!_lodash2.default.isBoolean(options.force)) {
    throw new TypeError('options.force value must be of boolean type.');
  }

  if (!_lodash2.default.isBoolean(options.log)) {
    throw new TypeError('options.log value must be of boolean type.');
  }

  if (!_lodash2.default.isNull(options.test) && !(_lodash2.default.isRegExp(options.test) || _lodash2.default.isFunction(options.test))) {
    throw new TypeError('options.test value must be an instance of RegExp or Function.');
  }

  if (!_lodash2.default.isBoolean(options.useHashIndex)) {
    throw new TypeError('options.useHashIndex value must be of boolean type.');
  }

  var log = function log() {
    for (var _len = arguments.length, append = Array(_len), _key = 0; _key < _len; _key++) {
      append[_key] = arguments[_key];
    }

    if (!options.log) {
      return;
    }

    debug.apply(undefined, [_chalk2.default.dim('[' + (0, _moment2.default)().format('HH:mm:ss') + ']')].concat(append));
  };

  var assetSourceHashIndex = {};

  log('options', options);

  var apply = function apply(compiler) {
    var outputPath = void 0;
    var setupDone = void 0;
    var setupStatus = void 0;

    var setup = function setup() {
      if (setupDone) {
        return setupStatus;
      }

      setupDone = true;

      log('compiler.outputFileSystem is "' + _chalk2.default.cyan(compiler.outputFileSystem.constructor.name) + '".');

      if (!isMemoryFileSystem(compiler.outputFileSystem) && !options.force) {
        return false;
      }

      outputPath = options.publicPath;

      log('outputPath is "' + _chalk2.default.cyan(outputPath) + '".');

      setupStatus = true;

      return setupStatus;
    };

    var handleAfterEmit = function handleAfterEmit(compilation, callback) {
      if (!setup()) {
        callback();

        return;
      }

      if (options.exitOnErrors && compilation.errors.length) {
        callback();

        return;
      }

      log('compilation.errors.length is "' + _chalk2.default.cyan(compilation.errors.length) + '".');

      _lodash2.default.forEach(compilation.assets, function (asset, assetPath) {
        var outputFilePath = _path2.default.isAbsolute(assetPath) ? assetPath : _path2.default.join(outputPath, assetPath);
        var relativeOutputPath = _path2.default.relative(process.cwd(), outputFilePath);
        var targetDefinition = 'asset: ' + _chalk2.default.cyan('./' + assetPath) + '; destination: ' + _chalk2.default.cyan('./' + relativeOutputPath);

        var test = options.test;

        if (test) {
          var skip = _lodash2.default.isRegExp(test) ? !test.test(assetPath) : !test(assetPath);

          if (skip) {
            log(targetDefinition, _chalk2.default.yellow('[skipped; does not match test]'));

            return;
          }
        }

        var assetSize = asset.size();
        var assetSource = Array.isArray(asset.source()) ? asset.source().join('\n') : asset.source();

        if (options.useHashIndex) {
          var assetSourceHash = (0, _crypto.createHash)('sha256').update(assetSource).digest('hex');

          if (assetSourceHashIndex[relativeOutputPath] && assetSourceHashIndex[relativeOutputPath] === assetSourceHash) {
            log(targetDefinition, _chalk2.default.yellow('[skipped; matched hash index]'));

            return;
          }

          assetSourceHashIndex[relativeOutputPath] = assetSourceHash;
        }

        var dirName = _path2.default.dirname(relativeOutputPath);

        RemoveFile(dirName);

        setTimeout(function () {
          return _mkdirp2.default.sync(dirName);
        }, 10);

        try {
          _fs2.default.writeFileSync(relativeOutputPath.split('?')[0], assetSource);
          log(targetDefinition, _chalk2.default.green('[written]'), _chalk2.default.magenta('(' + (0, _filesize2.default)(assetSize) + ')'));
        } catch (error) {
          log(targetDefinition, _chalk2.default.bold.red('[is not written]'), _chalk2.default.magenta('(' + (0, _filesize2.default)(assetSize) + ')'));
          log(_chalk2.default.bold.bgRed('Exception:'), _chalk2.default.bold.red(error.message));
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
module.exports = exports['default'];
//# sourceMappingURL=write-file.js.map