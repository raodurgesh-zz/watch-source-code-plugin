import WriteFilePlugin  from "./write-file";

function rewireWatchSourceCodePlugin(config, env, options = {}) {
  config.plugins.push(new WriteFilePlugin(options));
  return config;
}

export default rewireWatchSourceCodePlugin;
