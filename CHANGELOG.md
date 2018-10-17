<a name="1.0.0"></a>
# [1.0.0](https://github.com/wessberg/rollup-plugin-ts/compare/v0.0.44...v1.0.0) (2018-10-17)


### Features

* **release:** ground-up rewrite and some changes to the public API ([e43045c](https://github.com/wessberg/rollup-plugin-ts/commit/e43045c)), closes [#2](https://github.com/wessberg/rollup-plugin-ts/issues/2)


### BREAKING CHANGES

* **release:** The 'babel' config option has been removed in favor of 'babelConfig' which may point to a file on disk (such as a '.babelrc' or a 'babel.config.js') or be a dictionary of Babel options.
* **release:** The 'parseExternalModules' config option has been removed.