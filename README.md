# watch-source-code-plugin



Source code files used by `webpack-dev-server` is rendered in watch mode at user specified directory through override create-react-app webpack configs without ejecting.


## Installation

```sh
yarn add --dev watch-source-code-plugin
```

or

```sh
npm install --save-dev  watch-source-code-plugin
```


## Usage
In the `config-overrides.js` (refer : [react-app-rewired](https://github.com/timarney/react-app-rewired)) you created for `watch-source-code-plugin` add this code:

```
const { rewireSourceCodeBundle } = require('watch-source-code-plugin');

/* config-overrides.js */
module.exports = function override(config, env) {
  return rewireSourceCodeBundle(config, env, { publicPath : '<path of render directory i.e. '../server/build' >' });
}
```

## Inspirations
[write-file-webpack-plugin](https://github.com/gajus/write-file-webpack-plugin) by @gajus
