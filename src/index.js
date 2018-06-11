import WriteFilePlugin  from "write-file-webpack-plugin";

function rewireWatchSourceCodePlugin(config, env, options = {}) {
  config.plugins.push(new WriteFilePlugin(options));
  return config;
}

export default rewireWatchSourceCodePlugin;
