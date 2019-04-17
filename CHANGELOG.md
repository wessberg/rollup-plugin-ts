## [1.1.47](https://github.com/wessberg/rollup-plugin-ts/compare/v1.1.46...v1.1.47) (2019-04-17)

### Bug Fixes

- **bug:** fixes bug when producing declaration with namespace imports ([808e59e](https://github.com/wessberg/rollup-plugin-ts/commit/808e59e))
- **bug:** fixes issue with default exports of varying types ([d9bdd2a](https://github.com/wessberg/rollup-plugin-ts/commit/d9bdd2a))
- **bug:** fixes issue with default exports of varying types ([b01f4be](https://github.com/wessberg/rollup-plugin-ts/commit/b01f4be))
- **bug:** fixes issues where aliased imports could cause conflicts with merged symbols with name clashes ([c5c97cb](https://github.com/wessberg/rollup-plugin-ts/commit/c5c97cb))
- **bug:** fixes issues with aliased types with type parameters ([702e108](https://github.com/wessberg/rollup-plugin-ts/commit/702e108))
- **bug:** refined handling of default exports of unnamed classes ([0782f57](https://github.com/wessberg/rollup-plugin-ts/commit/0782f57))
- **bug:** refined handling of default exports of unnamed functions ([8efdaf7](https://github.com/wessberg/rollup-plugin-ts/commit/8efdaf7))

## [1.1.46](https://github.com/wessberg/rollup-plugin-ts/compare/v1.1.45...v1.1.46) (2019-04-11)

### Bug Fixes

- **bug:** fixes issue where babel helpers would force ESM variants even though they were marked as external. Fixes [#15](https://github.com/wessberg/rollup-plugin-ts/issues/15) ([f981b17](https://github.com/wessberg/rollup-plugin-ts/commit/f981b17))

### Features

- **format:** adds support for 'commonjs' and 'module' aliases for 'cjs' and 'esm' respectively ([16153b9](https://github.com/wessberg/rollup-plugin-ts/commit/16153b9))

## [1.1.45](https://github.com/wessberg/rollup-plugin-ts/compare/v1.1.44...v1.1.45) (2019-03-30)

## [1.1.44](https://github.com/wessberg/rollup-plugin-ts/compare/v1.1.43...v1.1.44) (2019-03-30)

### Bug Fixes

- **bug:** fixes an issue with an injected identifier not being found at all times ([1381c5e](https://github.com/wessberg/rollup-plugin-ts/commit/1381c5e))

### Features

- **EcmaVersion:** adds support for generating browserslists for browsers with support for ES2019 ([2c8ea0c](https://github.com/wessberg/rollup-plugin-ts/commit/2c8ea0c))
- **typescript:** makes it possible to detect and Ecma version for the ScriptTarget ES2019 ([b336547](https://github.com/wessberg/rollup-plugin-ts/commit/b336547))

## [1.1.43](https://github.com/wessberg/rollup-plugin-ts/compare/v1.1.42...v1.1.43) (2019-03-28)

### Bug Fixes

- **multi-entry:** fixes an interoperability issue with rollup-plugin-multi-entry where declarations wouldn't be able to detect the entry modules for multi entry chunks ([5c9c244](https://github.com/wessberg/rollup-plugin-ts/commit/5c9c244))

## [1.1.42](https://github.com/wessberg/rollup-plugin-ts/compare/v1.1.41...v1.1.42) (2019-03-28)

### Bug Fixes

- **babel:** fixes various issues with applying babel configs with glob/RegExp matching patterns as well as deduping and merging of config options. [#13](https://github.com/wessberg/rollup-plugin-ts/issues/13) ([1b8f2ee](https://github.com/wessberg/rollup-plugin-ts/commit/1b8f2ee))

## [1.1.41](https://github.com/wessberg/rollup-plugin-ts/compare/v1.1.40...v1.1.41) (2019-03-27)

### Bug Fixes

- **bug:** fixes an issue with resolving regenerator-runtime ([a7039ca](https://github.com/wessberg/rollup-plugin-ts/commit/a7039ca))
- **bug:** fixes bugs when 'allowJs' is true. Fixes bugs with providing tsconfig options directly ([40d2152](https://github.com/wessberg/rollup-plugin-ts/commit/40d2152))

## [1.1.40](https://github.com/wessberg/rollup-plugin-ts/compare/v1.1.39...v1.1.40) (2019-03-19)

### Bug Fixes

- **bug:** removes a console.log ([1450fa7](https://github.com/wessberg/rollup-plugin-ts/commit/1450fa7))

## [1.1.39](https://github.com/wessberg/rollup-plugin-ts/compare/v1.1.38...v1.1.39) (2019-03-19)

### Bug Fixes

- **bug:** fixes an issue with babel where applying minification-related plugins could lead to syntax errors ([2a91b7f](https://github.com/wessberg/rollup-plugin-ts/commit/2a91b7f))

## [1.1.38](https://github.com/wessberg/rollup-plugin-ts/compare/v1.1.37...v1.1.38) (2019-03-19)

### Bug Fixes

- **babel:** made it possible to babel to use the 'target' of a tsconfig without a browserslist. Made it possible to resolve tslib and babel helpers without additional resolver plugins ([76fd8a3](https://github.com/wessberg/rollup-plugin-ts/commit/76fd8a3))

## [1.1.37](https://github.com/wessberg/rollup-plugin-ts/compare/v1.1.36...v1.1.37) (2019-03-18)

## [1.1.36](https://github.com/wessberg/rollup-plugin-ts/compare/v1.1.35...v1.1.36) (2019-03-18)

### Features

- **option:** adds a new option 'transpileOnly' that can be toggled on to skip emitting (and checking for) diagnostics ([1a916d5](https://github.com/wessberg/rollup-plugin-ts/commit/1a916d5))
- **option:** adds a new option 'transpileOnly' that can be toggled on to skip emitting (and checking for) diagnostics ([90aaf8d](https://github.com/wessberg/rollup-plugin-ts/commit/90aaf8d))

## [1.1.35](https://github.com/wessberg/rollup-plugin-ts/compare/v1.1.34...v1.1.35) (2019-03-14)

## [1.1.34](https://github.com/wessberg/rollup-plugin-ts/compare/v1.1.33...v1.1.34) (2019-02-26)

### Bug Fixes

- **bug:** don't treeshake module declarations ([a022c5d](https://github.com/wessberg/rollup-plugin-ts/commit/a022c5d))
- **bug:** fixed an issue with declarations ([fb7e2ec](https://github.com/wessberg/rollup-plugin-ts/commit/fb7e2ec))

## [1.1.33](https://github.com/wessberg/rollup-plugin-ts/compare/v1.1.32...v1.1.33) (2019-02-26)

### Bug Fixes

- **bug:** fixes a bug where files with identical basenames, but varying extensions could lead to false positives when matching the cache under some circumstances ([28f7a09](https://github.com/wessberg/rollup-plugin-ts/commit/28f7a09))

## [1.1.32](https://github.com/wessberg/rollup-plugin-ts/compare/v1.1.31...v1.1.32) (2019-02-26)

### Bug Fixes

- **bug:** fixes a bug where files with identical basenames, but varying extensions could lead to false positives when matching the cache under some circumstances ([b560c03](https://github.com/wessberg/rollup-plugin-ts/commit/b560c03))

## [1.1.31](https://github.com/wessberg/rollup-plugin-ts/compare/v1.1.30...v1.1.31) (2019-02-25)

## [1.1.30](https://github.com/wessberg/rollup-plugin-ts/compare/v1.1.29...v1.1.30) (2019-02-25)

## [1.1.29](https://github.com/wessberg/rollup-plugin-ts/compare/v1.1.28...v1.1.29) (2019-02-25)

### Bug Fixes

- **bug:** adds support for missing node types ([b5de5ee](https://github.com/wessberg/rollup-plugin-ts/commit/b5de5ee))
- **bug:** adds support for missing node types ([608d38d](https://github.com/wessberg/rollup-plugin-ts/commit/608d38d))
- **bug:** adds support for missing node types ([9079f2d](https://github.com/wessberg/rollup-plugin-ts/commit/9079f2d))
- **bug:** adds support for missing node types ([6a90228](https://github.com/wessberg/rollup-plugin-ts/commit/6a90228))
- **bug:** fixes an issue where named exports could be removed under some circumstances ([322df0c](https://github.com/wessberg/rollup-plugin-ts/commit/322df0c))
- **bug:** fixes an issue with ExportAssignmens ([cafa7ad](https://github.com/wessberg/rollup-plugin-ts/commit/cafa7ad))

### Features

- **declarations:** far improved support for default exports/imports while bundling declarations across chunks ([4ad18d2](https://github.com/wessberg/rollup-plugin-ts/commit/4ad18d2))

## [1.1.28](https://github.com/wessberg/rollup-plugin-ts/compare/v1.1.27...v1.1.28) (2019-02-06)

### Bug Fixes

- **declarations:** fixes an issue with generating declarations ([1f93b05](https://github.com/wessberg/rollup-plugin-ts/commit/1f93b05))

## [1.1.27](https://github.com/wessberg/rollup-plugin-ts/compare/v1.1.26...v1.1.27) (2019-02-06)

## [1.1.26](https://github.com/wessberg/rollup-plugin-ts/compare/v1.1.25...v1.1.26) (2019-02-06)

### Bug Fixes

- **declarations:** fixes an issue with detecting the entry file name for a chunk ([7786000](https://github.com/wessberg/rollup-plugin-ts/commit/7786000))

## [1.1.25](https://github.com/wessberg/rollup-plugin-ts/compare/v1.1.24...v1.1.25) (2019-02-06)

### Bug Fixes

- **declarations:** fixes an issue with detecting the entry file name for a chunk ([01cc892](https://github.com/wessberg/rollup-plugin-ts/commit/01cc892))

## [1.1.24](https://github.com/wessberg/rollup-plugin-ts/compare/v1.1.23...v1.1.24) (2019-02-06)

### Bug Fixes

- **bug:** fixes a bug that could lead to misaligned content replacements ([d40ddbf](https://github.com/wessberg/rollup-plugin-ts/commit/d40ddbf))

## [1.1.23](https://github.com/wessberg/rollup-plugin-ts/compare/v1.1.22...v1.1.23) (2019-02-06)

### Bug Fixes

- **declarations:** fixes a variety of issues with generating declarations related to type-only files not being parsed in the declaration-emition phase ([50310ae](https://github.com/wessberg/rollup-plugin-ts/commit/50310ae))
- **declarations:** fixes an issue that arose with Rollup v1 where type-only files would not be part of the modules of emitted chunks. ([043ae50](https://github.com/wessberg/rollup-plugin-ts/commit/043ae50))

## [1.1.22](https://github.com/wessberg/rollup-plugin-ts/compare/v1.1.21...v1.1.22) (2019-02-04)

### Bug Fixes

- **declarations:** fixes an issue with generating declarations when ImportTypeNodes are being used ([493d8b1](https://github.com/wessberg/rollup-plugin-ts/commit/493d8b1))
- **dependencies:** updates dependencies ([ff72436](https://github.com/wessberg/rollup-plugin-ts/commit/ff72436))

## [1.1.21](https://github.com/wessberg/rollup-plugin-ts/compare/v1.1.20...v1.1.21) (2019-01-27)

### Bug Fixes

- **package:** adds back tslib as a hard dependency ([e6bcf1c](https://github.com/wessberg/rollup-plugin-ts/commit/e6bcf1c))

## [1.1.20](https://github.com/wessberg/rollup-plugin-ts/compare/v1.1.19...v1.1.20) (2019-01-24)

### Bug Fixes

- **package:** removes unneeded scripts ([43a4c0d](https://github.com/wessberg/rollup-plugin-ts/commit/43a4c0d))

## [1.1.19](https://github.com/wessberg/rollup-plugin-ts/compare/v1.1.18...v1.1.19) (2019-01-24)

### Bug Fixes

- **bug:** fixes an issue where default exports would be removed from declaration files ([c2c18ed](https://github.com/wessberg/rollup-plugin-ts/commit/c2c18ed))
- **package:** adds pretty-quick to commit hooks ([c07c616](https://github.com/wessberg/rollup-plugin-ts/commit/c07c616))
- **package:** removes unneeded scripts ([4275919](https://github.com/wessberg/rollup-plugin-ts/commit/4275919))

## [1.1.18](https://github.com/wessberg/rollup-plugin-ts/compare/v1.1.17...v1.1.18) (2019-01-17)

### Bug Fixes

- **bug:** fixes an issue where 'default' keywords would not be stripped from nodes for which the 'export' keyword had been removed ([ff0233e](https://github.com/wessberg/rollup-plugin-ts/commit/ff0233e))

## [1.1.17](https://github.com/wessberg/rollup-plugin-ts/compare/v1.1.16...v1.1.17) (2019-01-02)

## [1.1.16](https://github.com/wessberg/rollup-plugin-ts/compare/v1.1.15...v1.1.16) (2018-12-30)

## [1.1.15](https://github.com/wessberg/rollup-plugin-ts/compare/v1.1.14...v1.1.15) (2018-12-30)

### Bug Fixes

- **chore:** updated to Rollup v1.0.0 ([e20e5b0](https://github.com/wessberg/rollup-plugin-ts/commit/e20e5b0))

## [1.1.14](https://github.com/wessberg/rollup-plugin-ts/compare/v1.1.13...v1.1.14) (2018-12-21)

## [1.1.13](https://github.com/wessberg/rollup-plugin-ts/compare/v1.1.12...v1.1.13) (2018-12-21)

## [1.1.12](https://github.com/wessberg/rollup-plugin-ts/compare/v1.1.11...v1.1.12) (2018-12-20)

## [1.1.11](https://github.com/wessberg/rollup-plugin-ts/compare/v1.1.10...v1.1.11) (2018-12-17)

## [1.1.10](https://github.com/wessberg/rollup-plugin-ts/compare/v1.1.9...v1.1.10) (2018-12-13)

## [1.1.9](https://github.com/wessberg/rollup-plugin-ts/compare/v1.1.8...v1.1.9) (2018-12-06)

## [1.1.8](https://github.com/wessberg/rollup-plugin-ts/compare/v1.1.7...v1.1.8) (2018-12-05)

## [1.1.7](https://github.com/wessberg/rollup-plugin-ts/compare/v1.1.6...v1.1.7) (2018-11-29)

## [1.1.6](https://github.com/wessberg/rollup-plugin-ts/compare/v1.1.5...v1.1.6) (2018-11-28)

## [1.1.5](https://github.com/wessberg/rollup-plugin-ts/compare/v1.1.4...v1.1.5) (2018-11-28)

## [1.1.4](https://github.com/wessberg/rollup-plugin-ts/compare/v1.1.3...v1.1.4) (2018-11-14)

## [1.1.3](https://github.com/wessberg/rollup-plugin-ts/compare/v1.1.2...v1.1.3) (2018-11-14)

## [1.1.2](https://github.com/wessberg/rollup-plugin-ts/compare/v1.1.1...v1.1.2) (2018-11-13)

## [1.1.1](https://github.com/wessberg/rollup-plugin-ts/compare/v1.1.0...v1.1.1) (2018-11-13)

# [1.1.0](https://github.com/wessberg/rollup-plugin-ts/compare/v1.0.12...v1.1.0) (2018-11-12)

### Features

- **performance and interoperability:** improves performance and interoperability ([53e1eba](https://github.com/wessberg/rollup-plugin-ts/commit/53e1eba))

## [1.0.12](https://github.com/wessberg/rollup-plugin-ts/compare/1.0.12...v1.0.12) (2018-10-28)

## [1.0.11](https://github.com/wessberg/rollup-plugin-ts/compare/v1.0.10...v1.0.11) (2018-10-28)

### Features

- **declarations:** improves declaration (.d.ts) generation by a huge margin. ([348ff9f](https://github.com/wessberg/rollup-plugin-ts/commit/348ff9f))

## [1.0.10](https://github.com/wessberg/rollup-plugin-ts/compare/v1.0.9...v1.0.10) (2018-10-24)

## [1.0.9](https://github.com/wessberg/rollup-plugin-ts/compare/v1.0.8...v1.0.9) (2018-10-23)

### Bug Fixes

- fixes issues with tracking type-only files via Rollup ([da20aa2](https://github.com/wessberg/rollup-plugin-ts/commit/da20aa2)), closes [#5](https://github.com/wessberg/rollup-plugin-ts/issues/5)

## [1.0.8](https://github.com/wessberg/rollup-plugin-ts/compare/v1.0.7...v1.0.8) (2018-10-18)

## [1.0.7](https://github.com/wessberg/rollup-plugin-ts/compare/v1.0.6...v1.0.7) (2018-10-18)

## [1.0.6](https://github.com/wessberg/rollup-plugin-ts/compare/v1.0.5...v1.0.6) (2018-10-18)

### Bug Fixes

- **release:** Added 'files' array to package.json ([b5f16bf](https://github.com/wessberg/rollup-plugin-ts/commit/b5f16bf))

## [1.0.5](https://github.com/wessberg/rollup-plugin-ts/compare/v1.0.4...v1.0.5) (2018-10-18)

### Bug Fixes

- **bug:** Fixed an issue where declaration files found within a project directory wouldn't be discovered. ([719d5bd](https://github.com/wessberg/rollup-plugin-ts/commit/719d5bd))

## [1.0.4](https://github.com/wessberg/rollup-plugin-ts/compare/v1.0.3...v1.0.4) (2018-10-18)

### Features

- **interface:** Interfaces for Plugin input options are now exported ([b50683d](https://github.com/wessberg/rollup-plugin-ts/commit/b50683d))

## [1.0.3](https://github.com/wessberg/rollup-plugin-ts/compare/v1.0.2...v1.0.3) (2018-10-18)

### Features

- **interface:** Interfaces for Plugin input options are now exported ([a594de5](https://github.com/wessberg/rollup-plugin-ts/commit/a594de5))

## [1.0.2](https://github.com/wessberg/rollup-plugin-ts/compare/v1.0.1...v1.0.2) (2018-10-18)

### Features

- **interface:** Interfaces for Plugin input options are now exported ([9a93738](https://github.com/wessberg/rollup-plugin-ts/commit/9a93738))

## [1.0.1](https://github.com/wessberg/rollup-plugin-ts/compare/1.0.0...v1.0.1) (2018-10-17)

### Bug Fixes

- **lint:** Fixed linting issues ([178499c](https://github.com/wessberg/rollup-plugin-ts/commit/178499c))

# [1.0.0](https://github.com/wessberg/rollup-plugin-ts/compare/v0.0.44...v1.0.0) (2018-10-17)

### Features

- **release:** ground-up rewrite and some changes to the public API ([e43045c](https://github.com/wessberg/rollup-plugin-ts/commit/e43045c)), closes [#2](https://github.com/wessberg/rollup-plugin-ts/issues/2)
- Made JavaScript files resolved from the paths property inside a tsconfig be passed on to Rollup ([a1c990c](https://github.com/wessberg/rollup-plugin-ts/commit/a1c990c))

### BREAKING CHANGES

- **release:** The 'babel' config option has been removed in favor of 'babelConfig' which may point to a file on disk (such as a '.babelrc' or a 'babel.config.js') or be a dictionary of Babel options.
- **release:** The 'parseExternalModules' config option has been removed.

## [0.0.44](https://github.com/wessberg/rollup-plugin-ts/compare/v0.0.43...v0.0.44) (2018-10-05)

## [0.0.43](https://github.com/wessberg/rollup-plugin-ts/compare/v0.0.42...v0.0.43) (2018-09-28)

## [0.0.42](https://github.com/wessberg/rollup-plugin-ts/compare/v0.0.41...v0.0.42) (2018-09-28)

## [0.0.41](https://github.com/wessberg/rollup-plugin-ts/compare/v0.0.40...v0.0.41) (2018-09-26)

## [0.0.40](https://github.com/wessberg/rollup-plugin-ts/compare/v0.0.39...v0.0.40) (2018-08-30)

## [0.0.39](https://github.com/wessberg/rollup-plugin-ts/compare/v0.0.38...v0.0.39) (2018-08-30)

## [0.0.38](https://github.com/wessberg/rollup-plugin-ts/compare/v0.0.37...v0.0.38) (2018-08-30)

## [0.0.37](https://github.com/wessberg/rollup-plugin-ts/compare/v0.0.36...v0.0.37) (2018-08-25)

## [0.0.36](https://github.com/wessberg/rollup-plugin-ts/compare/v0.0.35...v0.0.36) (2018-08-14)

## [0.0.35](https://github.com/wessberg/rollup-plugin-ts/compare/v0.0.34...v0.0.35) (2018-08-09)

## [0.0.34](https://github.com/wessberg/rollup-plugin-ts/compare/v0.0.33...v0.0.34) (2018-08-08)

## [0.0.33](https://github.com/wessberg/rollup-plugin-ts/compare/v0.0.32...v0.0.33) (2018-08-08)

## [0.0.32](https://github.com/wessberg/rollup-plugin-ts/compare/v0.0.31...v0.0.32) (2018-07-18)

## [0.0.31](https://github.com/wessberg/rollup-plugin-ts/compare/v0.0.30...v0.0.31) (2018-07-18)

## [0.0.30](https://github.com/wessberg/rollup-plugin-ts/compare/v0.0.29...v0.0.30) (2018-06-30)

## [0.0.29](https://github.com/wessberg/rollup-plugin-ts/compare/v0.0.28...v0.0.29) (2018-06-27)

## [0.0.28](https://github.com/wessberg/rollup-plugin-ts/compare/v0.0.27...v0.0.28) (2018-06-27)

## [0.0.27](https://github.com/wessberg/rollup-plugin-ts/compare/v0.0.26...v0.0.27) (2018-06-25)

## [0.0.26](https://github.com/wessberg/rollup-plugin-ts/compare/v0.0.25...v0.0.26) (2018-06-21)

## [0.0.25](https://github.com/wessberg/rollup-plugin-ts/compare/v0.0.24...v0.0.25) (2018-06-13)

## [0.0.24](https://github.com/wessberg/rollup-plugin-ts/compare/v0.0.23...v0.0.24) (2018-06-13)

## [0.0.23](https://github.com/wessberg/rollup-plugin-ts/compare/v0.0.22...v0.0.23) (2018-06-12)

## [0.0.22](https://github.com/wessberg/rollup-plugin-ts/compare/v0.0.21...v0.0.22) (2018-06-08)

## [0.0.21](https://github.com/wessberg/rollup-plugin-ts/compare/v0.0.20...v0.0.21) (2018-06-08)

## [0.0.20](https://github.com/wessberg/rollup-plugin-ts/compare/v0.0.19...v0.0.20) (2018-06-07)

## [0.0.19](https://github.com/wessberg/rollup-plugin-ts/compare/v0.0.18...v0.0.19) (2018-06-07)

## [0.0.18](https://github.com/wessberg/rollup-plugin-ts/compare/v0.0.17...v0.0.18) (2018-06-01)

## [0.0.17](https://github.com/wessberg/rollup-plugin-ts/compare/v0.0.16...v0.0.17) (2018-05-30)

## [0.0.16](https://github.com/wessberg/rollup-plugin-ts/compare/v0.0.15...v0.0.16) (2018-05-28)

## [0.0.15](https://github.com/wessberg/rollup-plugin-ts/compare/v0.0.14...v0.0.15) (2018-05-01)

## [0.0.14](https://github.com/wessberg/rollup-plugin-ts/compare/v0.0.13...v0.0.14) (2018-04-30)

## [0.0.13](https://github.com/wessberg/rollup-plugin-ts/compare/v0.0.12...v0.0.13) (2018-04-30)

## [0.0.12](https://github.com/wessberg/rollup-plugin-ts/compare/v0.0.11...v0.0.12) (2018-04-29)

## [0.0.11](https://github.com/wessberg/rollup-plugin-ts/compare/v0.0.10...v0.0.11) (2018-04-29)

## [0.0.10](https://github.com/wessberg/rollup-plugin-ts/compare/v0.0.9...v0.0.10) (2018-04-25)

## [0.0.9](https://github.com/wessberg/rollup-plugin-ts/compare/v0.0.8...v0.0.9) (2018-04-18)

## [0.0.8](https://github.com/wessberg/rollup-plugin-ts/compare/v0.0.7...v0.0.8) (2018-04-04)

## [0.0.7](https://github.com/wessberg/rollup-plugin-ts/compare/v0.0.6...v0.0.7) (2018-03-31)

## [0.0.6](https://github.com/wessberg/rollup-plugin-ts/compare/v0.0.5...v0.0.6) (2018-03-30)

## [0.0.5](https://github.com/wessberg/rollup-plugin-ts/compare/v0.0.4...v0.0.5) (2018-03-30)

## [0.0.4](https://github.com/wessberg/rollup-plugin-ts/compare/v0.0.3...v0.0.4) (2018-03-29)

## [0.0.3](https://github.com/wessberg/rollup-plugin-ts/compare/v0.0.2...v0.0.3) (2018-03-29)

## [0.0.2](https://github.com/wessberg/rollup-plugin-ts/compare/v0.0.1...v0.0.2) (2018-03-29)

## 0.0.1 (2018-03-29)
