const  rewireBundle = require('../src');

/* config-overrides.js */
module.exports = function override(config, env) {
  return rewireBundle(config, env, { publicPath : '../server/build' });
}