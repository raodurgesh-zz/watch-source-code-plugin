"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.rewireWatchSourceCodePlugin = rewireWatchSourceCodePlugin;

var _writeFile = require("./write-file");

var _writeFile2 = _interopRequireDefault(_writeFile);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function rewireWatchSourceCodePlugin(config, env) {
  var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

  config.plugins.push(new _writeFile2.default(options));
  return config;
}
//# sourceMappingURL=index.js.map