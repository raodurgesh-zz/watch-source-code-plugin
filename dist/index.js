"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _writeFileWebpackPlugin = require("write-file-webpack-plugin");

var _writeFileWebpackPlugin2 = _interopRequireDefault(_writeFileWebpackPlugin);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function rewireWatchSourceCodePlugin(config, env) {
  var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

  config.plugins.push(new _writeFileWebpackPlugin2.default(options));
  return config;
}

exports.default = rewireWatchSourceCodePlugin;
module.exports = exports["default"];
//# sourceMappingURL=index.js.map