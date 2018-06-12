import WriteFilePlugin  from "./write-file";

export function rewireWatchSourceCodePlugin(config, env, options = {}) {
  config.plugins.push(new WriteFilePlugin(options));
  return config;
}


