const WriteFilePlugin = require( "./write-file");
const path = require('path');

module.exports = function rewireWatchSourceCodePlugin(config, env, options = {}) {
  config.output.path = path.join(process.cwd(), options.publicPath)
  config.plugins.push(new WriteFilePlugin(options));
  return config;
}


