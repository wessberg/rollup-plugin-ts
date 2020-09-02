## [1.3.4](https://github.com/wessberg/rollup-plugin-ts/compare/v1.3.3...v1.3.4) (2020-09-02)

### Bug Fixes

- **declarations:** add workaround for TypeScript issue 40361 for older TypeScript versions. Closes [#108](https://github.com/wessberg/rollup-plugin-ts/issues/108) ([659775f](https://github.com/wessberg/rollup-plugin-ts/commit/659775f3f8dc89b0e631be5edfe9110ffd2ece9c))

## [1.3.3](https://github.com/wessberg/rollup-plugin-ts/compare/v1.3.2...v1.3.3) (2020-08-23)

### Bug Fixes

- **declarations:** don't throw for JSDocDeprecatedTags. Closes [#111](https://github.com/wessberg/rollup-plugin-ts/issues/111) ([4adb49d](https://github.com/wessberg/rollup-plugin-ts/commit/4adb49db6ff01e8fd420db7d66d2eab2e65bf0b3))

## [1.3.2](https://github.com/wessberg/rollup-plugin-ts/compare/v1.3.1...v1.3.2) (2020-08-05)

## [1.3.1](https://github.com/wessberg/rollup-plugin-ts/compare/v1.3.0...v1.3.1) (2020-07-31)

### Bug Fixes

- **allowJs:** don't attempt to include .mjs files in a TypeScript program to align with tsc behavior. Fixes [#106](https://github.com/wessberg/rollup-plugin-ts/issues/106) ([f567d6c](https://github.com/wessberg/rollup-plugin-ts/commit/f567d6c4a9259568360af7c819cda4a95edc744d))

# [1.3.0](https://github.com/wessberg/rollup-plugin-ts/compare/v1.2.34...v1.3.0) (2020-07-31)

### Bug Fixes

- **external:** respect 'external' option provided to Rollup and don't inline typings from modules matched by it ([06f453a](https://github.com/wessberg/rollup-plugin-ts/commit/06f453a382d7b7f86c4d341eea53a5bfffecc8a3))

## [1.2.34](https://github.com/wessberg/rollup-plugin-ts/compare/v1.2.33...v1.2.34) (2020-07-29)

### Bug Fixes

- **hook:** fix declarationPaths type signature ([b8d6e7e](https://github.com/wessberg/rollup-plugin-ts/commit/b8d6e7e90c542003f1fdd89df544a0c4167a5e4b))

## [1.2.33](https://github.com/wessberg/rollup-plugin-ts/compare/v1.2.32...v1.2.33) (2020-07-29)

### Features

- **hook:** add 'declarationStats' hook. Fixes [#92](https://github.com/wessberg/rollup-plugin-ts/issues/92) ([bcb7084](https://github.com/wessberg/rollup-plugin-ts/commit/bcb7084800a5034215c45642c787ff44cd2051d1))

## [1.2.32](https://github.com/wessberg/rollup-plugin-ts/compare/v1.2.31...v1.2.32) (2020-07-29)

### Bug Fixes

- ensure that includedSourceFiles are always empty when allowDuplicate: true is passed as an option to includeSourceFile in moduleMerger. Fixes [#90](https://github.com/wessberg/rollup-plugin-ts/issues/90) ([796b92a](https://github.com/wessberg/rollup-plugin-ts/commit/796b92a518bd86e07c1e9c8aaba13957e88905bd))

## [1.2.31](https://github.com/wessberg/rollup-plugin-ts/compare/v1.2.30...v1.2.31) (2020-07-28)

### Bug Fixes

- **cache:** invalidate cached Programs if SourceFiles are added while it is being generated. Closes [#83](https://github.com/wessberg/rollup-plugin-ts/issues/83) ([d1e9777](https://github.com/wessberg/rollup-plugin-ts/commit/d1e9777869c54dc6f2663f552de8344a50ffad35))

## [1.2.30](https://github.com/wessberg/rollup-plugin-ts/compare/v1.2.29...v1.2.30) (2020-07-28)

### Bug Fixes

- **babel:** babel configs cannot be resolved correctly. Closes [#101](https://github.com/wessberg/rollup-plugin-ts/issues/101). Closes [#95](https://github.com/wessberg/rollup-plugin-ts/issues/95) ([044588e](https://github.com/wessberg/rollup-plugin-ts/commit/044588e67ff86791271f4f0e16d916b4ff5b9458))

## [1.2.29](https://github.com/wessberg/rollup-plugin-ts/compare/v1.2.28...v1.2.29) (2020-07-28)

### Bug Fixes

- **comments:** improve bundling and tree-shaking of comments. Fixes [#104](https://github.com/wessberg/rollup-plugin-ts/issues/104) ([559c420](https://github.com/wessberg/rollup-plugin-ts/commit/559c420adee0c044c7cd804aeb92c41191780d96))
- add missing return statement ([ded2524](https://github.com/wessberg/rollup-plugin-ts/commit/ded252413ef9ea9d958d00f3dd0b2f886673595c))
- declarations are sometimes empty. Closes [#105](https://github.com/wessberg/rollup-plugin-ts/issues/105) ([0e41f7c](https://github.com/wessberg/rollup-plugin-ts/commit/0e41f7c7cb0b400a12d9cac63597585e8d488e71))

## [1.2.28](https://github.com/wessberg/rollup-plugin-ts/compare/v1.2.27...v1.2.28) (2020-07-09)

### Bug Fixes

- **path-mapping:** fix an issue where path mapping for other baseUrls than '.' didn't work. Fixes [#96](https://github.com/wessberg/rollup-plugin-ts/issues/96) ([7f6c429](https://github.com/wessberg/rollup-plugin-ts/commit/7f6c42900454eaf5ae108bb289b3b83563071fef))

### Features

- **typescript:** add TypeScript v4 support. ([165b366](https://github.com/wessberg/rollup-plugin-ts/commit/165b3667e17074197b8370b35b7e9e238d4f93fe))
- add Christopher Blanchard as sponsor ([a70d0e6](https://github.com/wessberg/rollup-plugin-ts/commit/a70d0e6200d4c439818943b1a29190b1238a70bd))

## [1.2.27](https://github.com/wessberg/rollup-plugin-ts/compare/v1.2.26...v1.2.27) (2020-07-01)

### Bug Fixes

- Augment and merge non-namespace ModuleDeclarations. Closes [#99](https://github.com/wessberg/rollup-plugin-ts/issues/99) ([c78bc52](https://github.com/wessberg/rollup-plugin-ts/commit/c78bc52c746b1d462623c6dd0a7be1aa1551e2b1))
- generate new lexical environment for ConstructorDeclaration body. Closes [#100](https://github.com/wessberg/rollup-plugin-ts/issues/100) ([fe0aa94](https://github.com/wessberg/rollup-plugin-ts/commit/fe0aa948406a04922e9a80164ec41b39afb10d4b))

## [1.2.26](https://github.com/wessberg/rollup-plugin-ts/compare/v1.2.25...v1.2.26) (2020-06-22)

## [1.2.25](https://github.com/wessberg/rollup-plugin-ts/compare/v1.2.24...v1.2.25) (2020-06-10)

### Bug Fixes

- fix incompatibility with Windows ([f3a1045](https://github.com/wessberg/rollup-plugin-ts/commit/f3a10451f76918ddaea6a745cdc1d4c02f7ef411))
- fixed incorrect base path of tsconfig.json if it's inside a subdirectory ([0cfbf70](https://github.com/wessberg/rollup-plugin-ts/commit/0cfbf704f040fe2f06b8c4d438995ffe0c775bf7))
- use `nativeDirname` instead of `dirname` ([9efe47d](https://github.com/wessberg/rollup-plugin-ts/commit/9efe47d7d8d7aa6d3c605cce780d88b356aef391))
- **test:** fixed the glob filter of the virtual file system ([46ee07f](https://github.com/wessberg/rollup-plugin-ts/commit/46ee07ff5b40c381b4d0e80dd047af0fb4099c71))

## [1.2.24](https://github.com/wessberg/rollup-plugin-ts/compare/v1.2.23...v1.2.24) (2020-04-06)

### Bug Fixes

- **regenerator:** update inlined regenerator-runtime code to align with v0.13.5 ([ab869f2](https://github.com/wessberg/rollup-plugin-ts/commit/ab869f2584b06e10d480833d52373122119ae904))

## [1.2.23](https://github.com/wessberg/rollup-plugin-ts/compare/v1.2.22...v1.2.23) (2020-03-30)

### Bug Fixes

- **deconflicting:** fix issue where local symbols could conflict with external ones under some circumstances. [#88](https://github.com/wessberg/rollup-plugin-ts/issues/88) ([1f837f3](https://github.com/wessberg/rollup-plugin-ts/commit/1f837f377f98f5a179e7b4cf0722e5ed17ec8826))

## [1.2.22](https://github.com/wessberg/rollup-plugin-ts/compare/v1.2.21...v1.2.22) (2020-03-28)

### Features

- **typescript:** add TypeScript v3.9 support ([785dfa1](https://github.com/wessberg/rollup-plugin-ts/commit/785dfa149a3cccd0c7c6deaf79023f035dcf9837))

## [1.2.21](https://github.com/wessberg/rollup-plugin-ts/compare/v1.2.20...v1.2.21) (2020-03-06)

### Bug Fixes

- **type-directive:** fix an issue with generating type directives when declaration files are nested inside [@types](https://github.com/types) folder ([e23a571](https://github.com/wessberg/rollup-plugin-ts/commit/e23a571db900d5d4c8ba8a162f11482ceb6eb997))

## [1.2.20](https://github.com/wessberg/rollup-plugin-ts/compare/v1.2.19...v1.2.20) (2020-03-06)

## [1.2.19](https://github.com/wessberg/rollup-plugin-ts/compare/v1.2.18...v1.2.19) (2020-03-01)

### Bug Fixes

- make sure to respect entryFileNames and chunkFileNames when naming common declaration chunks ([a98fe69](https://github.com/wessberg/rollup-plugin-ts/commit/a98fe696d997149a0b5ce08e1f7dcc69019d509a))

## [1.2.18](https://github.com/wessberg/rollup-plugin-ts/compare/v1.2.17...v1.2.18) (2020-02-29)

### Bug Fixes

- **namespace-export:** add support for named namespace exports ([8aece24](https://github.com/wessberg/rollup-plugin-ts/commit/8aece24d1de3e4d7cf6721026961f0e5caee5e4b))
- add 'isTypeOnly' to 'updateImportClause' helpers ([9688e0e](https://github.com/wessberg/rollup-plugin-ts/commit/9688e0eb4354650459f142dea6d3fdcd2bb02cf0))

## [1.2.17](https://github.com/wessberg/rollup-plugin-ts/compare/v1.2.16...v1.2.17) (2020-02-13)

### Bug Fixes

- respect declaration merging when identifiers are declared in the same SourceFile. Closes [#81](https://github.com/wessberg/rollup-plugin-ts/issues/81) ([7e44925](https://github.com/wessberg/rollup-plugin-ts/commit/7e4492574dec4f43debf52823b45a0c4c063f24d))
- use statement merger on nested namespace declarations to remove binding-less imports/exports for prettier declaration output under some circumstances ([d23a86e](https://github.com/wessberg/rollup-plugin-ts/commit/d23a86e04193b3bfd562f7f42e0f39c7f2f664ca))

## [1.2.16](https://github.com/wessberg/rollup-plugin-ts/compare/v1.2.15...v1.2.16) (2020-02-08)

### Bug Fixes

- don't force drive letter on relative paths ([69350c7](https://github.com/wessberg/rollup-plugin-ts/commit/69350c76e784385bf2815bfa69afdc1297eb8b4c))
- ensure that absolute paths on Windows always include the drive letter before passing it on to TypeScript ([6713cb1](https://github.com/wessberg/rollup-plugin-ts/commit/6713cb1305d68c6356d425153f2834253a6e8602))
- fix bug on windows where paths weren't always normalized ([c0b136b](https://github.com/wessberg/rollup-plugin-ts/commit/c0b136b7af21bf0cd5087573459c65b3aab23138))

## [1.2.15](https://github.com/wessberg/rollup-plugin-ts/compare/v1.2.14...v1.2.15) (2020-01-29)

## [1.2.14](https://github.com/wessberg/rollup-plugin-ts/compare/v1.2.13...v1.2.14) (2020-01-27)

### Bug Fixes

- **babel:** unpin babel dependencies ([9ea5335](https://github.com/wessberg/rollup-plugin-ts/commit/9ea5335edbad45f8d5911823ded41f5ef0534ca7))

## [1.2.13](https://github.com/wessberg/rollup-plugin-ts/compare/v1.2.12...v1.2.13) (2020-01-14)

### Bug Fixes

- stop relying on babel/core internals for finding configs and instead rely on the public API at all times ([3b73419](https://github.com/wessberg/rollup-plugin-ts/commit/3b73419941ffa9899c2cdeedca3726647f04261f))

## [1.2.12](https://github.com/wessberg/rollup-plugin-ts/compare/v1.2.11...v1.2.12) (2020-01-13)

### Bug Fixes

- Ensure that the Qualifier for ImportTypeNodes preserve the original binding name from external modules ([c7db633](https://github.com/wessberg/rollup-plugin-ts/commit/c7db633618182211768a32f19b7ee2ad08940043))

## [1.2.11](https://github.com/wessberg/rollup-plugin-ts/compare/v1.2.10...v1.2.11) (2020-01-13)

### Bug Fixes

- fix bug where ImportTypeNodes inside other ImportTypeNodes weren't tracked correctly ([4369f0c](https://github.com/wessberg/rollup-plugin-ts/commit/4369f0c19d3f39e8ce90b6fd0526fd701d9e3f3c))
- fix bug where ImportTypeNodes would lose their type arguments ([8ced5c9](https://github.com/wessberg/rollup-plugin-ts/commit/8ced5c9abe77d35ac8af8f900a53ecbd9588b07e))

## [1.2.10](https://github.com/wessberg/rollup-plugin-ts/compare/v1.2.9...v1.2.10) (2020-01-13)

### Features

- **json:** improve interoperability with @rollup/plugin-json ([e9a64a7](https://github.com/wessberg/rollup-plugin-ts/commit/e9a64a7125fff940491934f2a999eb8c0e3c6b4a))

## [1.2.9](https://github.com/wessberg/rollup-plugin-ts/compare/v1.2.8...v1.2.9) (2020-01-13)

## [1.2.8](https://github.com/wessberg/rollup-plugin-ts/compare/v1.2.7...v1.2.8) (2020-01-12)

## [1.2.7](https://github.com/wessberg/rollup-plugin-ts/compare/v1.2.6...v1.2.7) (2020-01-12)

### Bug Fixes

- fix issue with type aliasing classes. Closes [#68](https://github.com/wessberg/rollup-plugin-ts/issues/68) ([e00fc5a](https://github.com/wessberg/rollup-plugin-ts/commit/e00fc5a03f7c40383f9f32cde505555662f0e53b))

## [1.2.6](https://github.com/wessberg/rollup-plugin-ts/compare/v1.2.5...v1.2.6) (2020-01-11)

### Bug Fixes

- **tree-shaking:** fix issue where computed property names inside Property- and MethodSignatures would not count as a reference to a symbol. Make sure to create a new lexical environment for FunctionTypeNodes. Closes [#69](https://github.com/wessberg/rollup-plugin-ts/issues/69). ([b7a0bd1](https://github.com/wessberg/rollup-plugin-ts/commit/b7a0bd1463234e6540ca080e77408465dd0d05c4))

## [1.2.5](https://github.com/wessberg/rollup-plugin-ts/compare/v1.2.4...v1.2.5) (2020-01-10)

### Bug Fixes

- fix bug where ambient sources were mistakenly added to the Rollup graph. Closes [#71](https://github.com/wessberg/rollup-plugin-ts/issues/71). Improve JSDoc support. Closes [#64](https://github.com/wessberg/rollup-plugin-ts/issues/64) ([5b9e7d7](https://github.com/wessberg/rollup-plugin-ts/commit/5b9e7d7de09281f63de04635d76b83ae46a3dab9))
- fix core-js self-referencing transformations when preset-env is combined with useBuiltIns: 'usage'. Closes [#55](https://github.com/wessberg/rollup-plugin-ts/issues/55) ([b31478c](https://github.com/wessberg/rollup-plugin-ts/commit/b31478c68ce857225b88ac3825998a16feda2ea9))

## [1.2.4](https://github.com/wessberg/rollup-plugin-ts/compare/v1.2.3...v1.2.4) (2020-01-07)

### Bug Fixes

- add support for incremental compilation. Closes [#67](https://github.com/wessberg/rollup-plugin-ts/issues/67). Closes [#66](https://github.com/wessberg/rollup-plugin-ts/issues/66) ([c1e4dcc](https://github.com/wessberg/rollup-plugin-ts/commit/c1e4dccc9f42a5e42a687e342328c5d30248dc36))

## [1.2.3](https://github.com/wessberg/rollup-plugin-ts/compare/v1.2.2...v1.2.3) (2020-01-05)

### Bug Fixes

- allow generating SourceFiles for files matched by a user-provided 'exclude' glob. Closes [#65](https://github.com/wessberg/rollup-plugin-ts/issues/65) ([c54c1e6](https://github.com/wessberg/rollup-plugin-ts/commit/c54c1e600f54dfe17658eb46f2431285172b2314))

## [1.2.2](https://github.com/wessberg/rollup-plugin-ts/compare/v1.2.1...v1.2.2) (2020-01-05)

### Bug Fixes

- Fix watch mode. Closes [#63](https://github.com/wessberg/rollup-plugin-ts/issues/63) ([1d54c95](https://github.com/wessberg/rollup-plugin-ts/commit/1d54c95c54e30c6e630fe13c3dffa3b1f5cb13d6))

### Performance Improvements

- improve performance ([9fa2756](https://github.com/wessberg/rollup-plugin-ts/commit/9fa2756ff1967482231e8e14053a137a35da3edf))

## [1.2.1](https://github.com/wessberg/rollup-plugin-ts/compare/v1.2.0...v1.2.1) (2020-01-03)

### Bug Fixes

- fix issue with cloning MethodSignatures with modifiers. Closes [#62](https://github.com/wessberg/rollup-plugin-ts/issues/62) ([bbffc35](https://github.com/wessberg/rollup-plugin-ts/commit/bbffc35ae266828e811110666614bf7d05756b92))

### Performance Improvements

- improve performance ([7ee2422](https://github.com/wessberg/rollup-plugin-ts/commit/7ee2422c4de70dda87038b608d2600642eb140ed))

# [1.2.0](https://github.com/wessberg/rollup-plugin-ts/compare/v1.1.83...v1.2.0) (2019-12-31)

### Bug Fixes

- spread out tests to avoid memory issues on Node 8 on CI ([ebec44c](https://github.com/wessberg/rollup-plugin-ts/commit/ebec44c1f65fcf864cacfeb8465c43ca7f714bd2))
- spread out tests to avoid memory issues on Node 8 on CI ([3cc8021](https://github.com/wessberg/rollup-plugin-ts/commit/3cc80210b07e50118dcc1fe3d2acf6d04bedf5be))
- **babel:** add @babel/plugin-syntax-dynamic-import as top-level dependency to improve pnpm support that relies on a nested dependency tree ([387d4d1](https://github.com/wessberg/rollup-plugin-ts/commit/387d4d1eeda01e119412b1b5669dc1ade6dd07bb))

## [1.1.83](https://github.com/wessberg/rollup-plugin-ts/compare/v1.1.82...v1.1.83) (2019-11-28)

### Bug Fixes

- **bug:** fix multiple aliased exports from same module ([db29b86](https://github.com/wessberg/rollup-plugin-ts/commit/db29b86c0714c81a0053b92ac071e9cba6c86893))

## [1.1.82](https://github.com/wessberg/rollup-plugin-ts/compare/v1.1.81...v1.1.82) (2019-11-28)

### Bug Fixes

- **bug:** fix multiple aliased exports from same module ([d7e7ec5](https://github.com/wessberg/rollup-plugin-ts/commit/d7e7ec578c8e0f56ab8b9aeaff4a2db3c5d4f5d5))

## [1.1.81](https://github.com/wessberg/rollup-plugin-ts/compare/v1.1.80...v1.1.81) (2019-11-28)

### Bug Fixes

- **bug:** fix with multiple duplicate reexports ([294d7c5](https://github.com/wessberg/rollup-plugin-ts/commit/294d7c519e723260eb9378fd6d0b307947f95446))

## [1.1.80](https://github.com/wessberg/rollup-plugin-ts/compare/v1.1.79...v1.1.80) (2019-11-17)

### Bug Fixes

- **builtins:** fix issue where packages with identical names to built in modules wasn't resolvable. Closes [#46](https://github.com/wessberg/rollup-plugin-ts/issues/46) ([fe266f6](https://github.com/wessberg/rollup-plugin-ts/commit/fe266f69df5cb318acf3a2470237a1e12c3f17ac))

## [1.1.79](https://github.com/wessberg/rollup-plugin-ts/compare/v1.1.78...v1.1.79) (2019-11-17)

### Features

- **hook:** add 'diagnostics' hook. Closes [#50](https://github.com/wessberg/rollup-plugin-ts/issues/50) ([75fb907](https://github.com/wessberg/rollup-plugin-ts/commit/75fb90739398162f7c0903da795b086a2d1135c9))

## [1.1.78](https://github.com/wessberg/rollup-plugin-ts/compare/v1.1.77...v1.1.78) (2019-11-13)

### Bug Fixes

- **bug:** always use LF line endings when formatting with Prettier inside test runner ([1a98dff](https://github.com/wessberg/rollup-plugin-ts/commit/1a98dff5d739a7d9587c3fc3edb2a26f06195db7))
- **bug:** fix bug where paths could be POSIX on Windows in the modularizing phase ([6401151](https://github.com/wessberg/rollup-plugin-ts/commit/6401151df8a8edeb4638c5ea5c6e8c51943c3c39))
- **bug:** fix issue on Windows with generating declaration maps ([3e971bc](https://github.com/wessberg/rollup-plugin-ts/commit/3e971bc44009f1653605ab8805c4f1449525ea2d))
- **bug:** support multiple environments inside code splitting tests ([ca5aa78](https://github.com/wessberg/rollup-plugin-ts/commit/ca5aa78c7692e9d341d76cadff79a48b978ed3c8))

## [1.1.77](https://github.com/wessberg/rollup-plugin-ts/compare/v1.1.76...v1.1.77) (2019-11-13)

### Bug Fixes

- **bug:** fix regression with same-chunk default exports. Closes [#48](https://github.com/wessberg/rollup-plugin-ts/issues/48) ([0831af7](https://github.com/wessberg/rollup-plugin-ts/commit/0831af78ff45266236b614aa892894ad350b9ed4))

## [1.1.76](https://github.com/wessberg/rollup-plugin-ts/compare/v1.1.75...v1.1.76) (2019-11-11)

### Features

- **statement merging:** add support for merging type- and lib reference directives ([92122b1](https://github.com/wessberg/rollup-plugin-ts/commit/92122b1da43de7950e76e9e4a5fda3abfedd3dd2))

## [1.1.75](https://github.com/wessberg/rollup-plugin-ts/compare/v1.1.74...v1.1.75) (2019-11-11)

### Bug Fixes

- **bug:** fix bug that could lead to conflicting local symbols ([de41822](https://github.com/wessberg/rollup-plugin-ts/commit/de41822c0757301a9d16483efda12e22aaa7373d))
- **bug:** fix bug where multiple rollup configs inside a compilation unit could lead to faulty cashes ([2ad464b](https://github.com/wessberg/rollup-plugin-ts/commit/2ad464bff61a8e525ce0cf2c351afdc3016f3661))

## [1.1.74](https://github.com/wessberg/rollup-plugin-ts/compare/v1.1.73...v1.1.74) (2019-11-09)

### Bug Fixes

- ensure no needless identical propertyNames and names in ExportSpecifiers ([eb448ec](https://github.com/wessberg/rollup-plugin-ts/commit/eb448ec0398b386359441bc52008760217f75c23))

### Features

- allow to override the search base of the LIB_DIRECTORY lookup ([26326a4](https://github.com/wessberg/rollup-plugin-ts/commit/26326a4b92babee3b1bb67f935fca0f1ac970f18))
- **declarations:** declaration generation refactoring ([ee3bfa0](https://github.com/wessberg/rollup-plugin-ts/commit/ee3bfa0c781ab2e39f94c7952640d51003d35ed6))
- **declarations:** more refactoring work ([25b21cb](https://github.com/wessberg/rollup-plugin-ts/commit/25b21cb3cd7d5a52c92acf08861a9147685f45e8))

## [1.1.73](https://github.com/wessberg/rollup-plugin-ts/compare/v1.1.72...v1.1.73) (2019-10-19)

### Bug Fixes

- **bug:** fix issue with generating declarations for files containing '.' in their file names ([f1be238](https://github.com/wessberg/rollup-plugin-ts/commit/f1be23886b249ca2b83b1af6b799c76e056689aa))
- **bug:** fix issues with directory imports (implicit /index files) ([5d329cd](https://github.com/wessberg/rollup-plugin-ts/commit/5d329cdf3920ea99dabcf86bda43ccd42eca6dbb))

## [1.1.72](https://github.com/wessberg/rollup-plugin-ts/compare/v1.1.71...v1.1.72) (2019-10-16)

### Bug Fixes

- **bug:** add missing TypeQueryNode wrapper when reassigning imported bindings to VariableDeclarations when bundling declarations. Fixes [#36](https://github.com/wessberg/rollup-plugin-ts/issues/36) ([dcd2be4](https://github.com/wessberg/rollup-plugin-ts/commit/dcd2be4b3ec0aac9725faa446345a63fc3cf467c))

## [1.1.71](https://github.com/wessberg/rollup-plugin-ts/compare/v1.1.70...v1.1.71) (2019-10-15)

### Bug Fixes

- **bug:** fix issue where exporting bindings from external libraries could lead to issues. Fixes [#33](https://github.com/wessberg/rollup-plugin-ts/issues/33) ([7520fcf](https://github.com/wessberg/rollup-plugin-ts/commit/7520fcfd8e8952d6a31863d70172c9426af91c06))

## [1.1.70](https://github.com/wessberg/rollup-plugin-ts/compare/v1.1.69...v1.1.70) (2019-10-15)

## [1.1.69](https://github.com/wessberg/rollup-plugin-ts/compare/v1.1.68...v1.1.69) (2019-10-15)

## [1.1.68](https://github.com/wessberg/rollup-plugin-ts/compare/v1.1.67...v1.1.68) (2019-10-15)

## [1.1.67](https://github.com/wessberg/rollup-plugin-ts/compare/v1.1.66...v1.1.67) (2019-10-15)

## [1.1.66](https://github.com/wessberg/rollup-plugin-ts/compare/v1.1.65...v1.1.66) (2019-10-10)

### Bug Fixes

- **declarations:** makes sure to use 'declare' keyword where required, and to never use it for declarations within a namespace in an already ambient context. Fixes [#24](https://github.com/wessberg/rollup-plugin-ts/issues/24). Fixes [#32](https://github.com/wessberg/rollup-plugin-ts/issues/32) ([b71e594](https://github.com/wessberg/rollup-plugin-ts/commit/b71e594ae4a344126737740ebcfd33bd14119427))

## [1.1.65](https://github.com/wessberg/rollup-plugin-ts/compare/v1.1.64...v1.1.65) (2019-09-30)

### Features

- **hook:** add hook that can rewrite output paths before files are emitted. ([4ec63ba](https://github.com/wessberg/rollup-plugin-ts/commit/4ec63bab33763f924fbf38fc276573f5c3c6ab4e))

## [1.1.64](https://github.com/wessberg/rollup-plugin-ts/compare/v1.1.63...v1.1.64) (2019-08-29)

## [1.1.63](https://github.com/wessberg/rollup-plugin-ts/compare/v1.1.62...v1.1.63) (2019-08-12)

### Features

- **declarations:** mark export-less declaration files as modules ([26ffe4b](https://github.com/wessberg/rollup-plugin-ts/commit/26ffe4be5c374027ce82602af4a9b3f41d6a4e4d))

## [1.1.62](https://github.com/wessberg/rollup-plugin-ts/compare/v1.1.61...v1.1.62) (2019-07-15)

### Bug Fixes

- **bug:** fixes an issue with resolving .babelrc files when no explicit path has been given. Closes [#25](https://github.com/wessberg/rollup-plugin-ts/issues/25) ([be1c80b](https://github.com/wessberg/rollup-plugin-ts/commit/be1c80bc2f6944acfa863dc4aa0312ad16c991cd))

## [1.1.61](https://github.com/wessberg/rollup-plugin-ts/compare/v1.1.60...v1.1.61) (2019-07-10)

### Bug Fixes

- **bug:** fixes an issue on Windows that could lead to duplicate symbols. Closes [#23](https://github.com/wessberg/rollup-plugin-ts/issues/23) ([2183af2](https://github.com/wessberg/rollup-plugin-ts/commit/2183af21683d5d7f68e58d63e6983b4ce2ce7d63))

## [1.1.60](https://github.com/wessberg/rollup-plugin-ts/compare/v1.1.59...v1.1.60) (2019-07-09)

## [1.1.59](https://github.com/wessberg/rollup-plugin-ts/compare/v1.1.58...v1.1.59) (2019-06-21)

### Bug Fixes

- **declaration maps:** fixes issue with generating declaration maps ([d45e5e1](https://github.com/wessberg/rollup-plugin-ts/commit/d45e5e1c9df1c6cc4629df014a4bf95f22cb26f4))

## [1.1.58](https://github.com/wessberg/rollup-plugin-ts/compare/v1.1.57...v1.1.58) (2019-06-21)

## [1.1.57](https://github.com/wessberg/rollup-plugin-ts/compare/v1.1.56...v1.1.57) (2019-06-20)

### Bug Fixes

- **bug:** rollback on Caniuse version to 4.6.2 which doesn't include a dependency on the bad version of caniuse-lite ([78cbca4](https://github.com/wessberg/rollup-plugin-ts/commit/78cbca4d0e2a68bdf627b06aa0b3bfff6ba36d1d))
- **bug:** rollback on Caniuse version to 4.6.2 which doesn't include a dependency on the bad version of caniuse-lite ([0160ea9](https://github.com/wessberg/rollup-plugin-ts/commit/0160ea9ed886204e7d3d7ef2a07fd63c3a7ee1a4))

## [1.1.56](https://github.com/wessberg/rollup-plugin-ts/compare/v1.1.55...v1.1.56) (2019-06-20)

### Bug Fixes

- **bug:** updates dependencies ([15ed99c](https://github.com/wessberg/rollup-plugin-ts/commit/15ed99c2381ae836da9cd8923821ee4a8b97b162))

## [1.1.55](https://github.com/wessberg/rollup-plugin-ts/compare/v1.1.54...v1.1.55) (2019-06-06)

### Bug Fixes

- **windows:** fixes issues with building and generating declarations on Windows. Fixes [#19](https://github.com/wessberg/rollup-plugin-ts/issues/19), [#21](https://github.com/wessberg/rollup-plugin-ts/issues/21). Fixes issue with transitive barrel exports. Fixes [#10](https://github.com/wessberg/rollup-plugin-ts/issues/10) ([d41f915](https://github.com/wessberg/rollup-plugin-ts/commit/d41f9152ca0b9b020ec1cf2fa02b4e8fc15fced0))

## [1.1.54](https://github.com/wessberg/rollup-plugin-ts/compare/v1.1.53...v1.1.54) (2019-05-29)

### Bug Fixes

- **bug:** fixes regression with find-up ([b2ef2de](https://github.com/wessberg/rollup-plugin-ts/commit/b2ef2de31e215706bd6d0f50edb1c73878bd6a6c))

## [1.1.53](https://github.com/wessberg/rollup-plugin-ts/compare/v1.1.52...v1.1.53) (2019-05-29)

### Features

- **tsconfig:** adds support for providing a function as argument to 'tsconfig' which receives CompilerOptions and allows you to override them. ([6ff8fed](https://github.com/wessberg/rollup-plugin-ts/commit/6ff8fedd027c6b98d5c2f47527b0dd036535ca4e))

## [1.1.52](https://github.com/wessberg/rollup-plugin-ts/compare/v1.1.51...v1.1.52) (2019-04-26)

## [1.1.51](https://github.com/wessberg/rollup-plugin-ts/compare/v1.1.50...v1.1.51) (2019-04-23)

### Bug Fixes

- **bug:** fixes a bug that could lead to infinite recursion when some runtime babel helpers would transform themselves ([4f2eb9e](https://github.com/wessberg/rollup-plugin-ts/commit/4f2eb9e097dccf340dac1d750583ec9437b05533))

## [1.1.50](https://github.com/wessberg/rollup-plugin-ts/compare/v1.1.49...v1.1.50) (2019-04-22)

### Features

- **options:** makes it possible to pass in both proper CompilerOptions as well as raw, JSON-esque compiler options when giving the tsconfig as an option ([0607b6d](https://github.com/wessberg/rollup-plugin-ts/commit/0607b6d1328690b6af0bc86957d4136fef01fd0d))

## [1.1.49](https://github.com/wessberg/rollup-plugin-ts/compare/v1.1.48...v1.1.49) (2019-04-22)

### Bug Fixes

- **bug:** fixes a bug that could lead to missing exports ([b52a245](https://github.com/wessberg/rollup-plugin-ts/commit/b52a2457ede04f98bc89886551980d0e61aece1c))

## [1.1.48](https://github.com/wessberg/rollup-plugin-ts/compare/v1.1.47...v1.1.48) (2019-04-22)

### Bug Fixes

- **bug:** fixes a bug where the 'transpileOnly' option would never be respected ([7bfe829](https://github.com/wessberg/rollup-plugin-ts/commit/7bfe8298ccb71bca4635518aa15cd80c2f76e1e2))

## [1.1.47](https://github.com/wessberg/rollup-plugin-ts/compare/v1.1.46...v1.1.47) (2019-04-17)

### Bug Fixes

- **bug:** fixes bug when producing declaration with namespace imports ([808e59e](https://github.com/wessberg/rollup-plugin-ts/commit/808e59e5ef796bdfc9448be93f214044b811ebce))
- **bug:** fixes issue with default exports of varying types ([d9bdd2a](https://github.com/wessberg/rollup-plugin-ts/commit/d9bdd2a0d52f38919d851825542149d8ac306590))
- **bug:** fixes issue with default exports of varying types ([b01f4be](https://github.com/wessberg/rollup-plugin-ts/commit/b01f4be6042e41e05a73dbe5f42702d20985e73e))
- **bug:** fixes issues where aliased imports could cause conflicts with merged symbols with name clashes ([c5c97cb](https://github.com/wessberg/rollup-plugin-ts/commit/c5c97cb76555cb503ca8268c3318a4c18d59f9ec))
- **bug:** fixes issues with aliased types with type parameters ([702e108](https://github.com/wessberg/rollup-plugin-ts/commit/702e108c2efdf3748139a17afb9b3f68c05da423))
- **bug:** refined handling of default exports of unnamed classes ([0782f57](https://github.com/wessberg/rollup-plugin-ts/commit/0782f57f549efc09879f2c66a02b430b497e281b))
- **bug:** refined handling of default exports of unnamed functions ([8efdaf7](https://github.com/wessberg/rollup-plugin-ts/commit/8efdaf7346f8606b2c6226e463a9ed06f38cc226))

## [1.1.46](https://github.com/wessberg/rollup-plugin-ts/compare/v1.1.45...v1.1.46) (2019-04-11)

### Bug Fixes

- **bug:** fixes issue where babel helpers would force ESM variants even though they were marked as external. Fixes [#15](https://github.com/wessberg/rollup-plugin-ts/issues/15) ([f981b17](https://github.com/wessberg/rollup-plugin-ts/commit/f981b17326b1d249e6093f6cc829a4408b5b88b6))

### Features

- **format:** adds support for 'commonjs' and 'module' aliases for 'cjs' and 'esm' respectively ([16153b9](https://github.com/wessberg/rollup-plugin-ts/commit/16153b9dcc5d75eb994b5abbb60440e647d1e80c))

## [1.1.45](https://github.com/wessberg/rollup-plugin-ts/compare/v1.1.44...v1.1.45) (2019-03-30)

## [1.1.44](https://github.com/wessberg/rollup-plugin-ts/compare/v1.1.43...v1.1.44) (2019-03-30)

### Bug Fixes

- **bug:** fixes an issue with an injected identifier not being found at all times ([1381c5e](https://github.com/wessberg/rollup-plugin-ts/commit/1381c5e43e4746b6f7da12408e1047d6669c3a78))

### Features

- **EcmaVersion:** adds support for generating browserslists for browsers with support for ES2019 ([2c8ea0c](https://github.com/wessberg/rollup-plugin-ts/commit/2c8ea0c685e25f6d11b1bca3c74ffbe1b0889a79))
- **typescript:** makes it possible to detect and Ecma version for the ScriptTarget ES2019 ([b336547](https://github.com/wessberg/rollup-plugin-ts/commit/b336547f02657712e11eba5e3d168853be948652))

## [1.1.43](https://github.com/wessberg/rollup-plugin-ts/compare/v1.1.42...v1.1.43) (2019-03-28)

### Bug Fixes

- **multi-entry:** fixes an interoperability issue with rollup-plugin-multi-entry where declarations wouldn't be able to detect the entry modules for multi entry chunks ([5c9c244](https://github.com/wessberg/rollup-plugin-ts/commit/5c9c244babcac91b4e20717a896d2f1804627e89))

## [1.1.42](https://github.com/wessberg/rollup-plugin-ts/compare/v1.1.41...v1.1.42) (2019-03-28)

### Bug Fixes

- **babel:** fixes various issues with applying babel configs with glob/RegExp matching patterns as well as deduping and merging of config options. [#13](https://github.com/wessberg/rollup-plugin-ts/issues/13) ([1b8f2ee](https://github.com/wessberg/rollup-plugin-ts/commit/1b8f2ee6fdd39272534c61a590842184ebea98ad))

## [1.1.41](https://github.com/wessberg/rollup-plugin-ts/compare/v1.1.40...v1.1.41) (2019-03-27)

### Bug Fixes

- **bug:** fixes an issue with resolving regenerator-runtime ([a7039ca](https://github.com/wessberg/rollup-plugin-ts/commit/a7039ca1106256ce91a0a688ef12f61e8278c0bb))
- **bug:** fixes bugs when 'allowJs' is true. Fixes bugs with providing tsconfig options directly ([40d2152](https://github.com/wessberg/rollup-plugin-ts/commit/40d2152b3ecf008e6fcc623d060d1356e3fff727))

## [1.1.40](https://github.com/wessberg/rollup-plugin-ts/compare/v1.1.39...v1.1.40) (2019-03-19)

### Bug Fixes

- **bug:** removes a console.log ([1450fa7](https://github.com/wessberg/rollup-plugin-ts/commit/1450fa77c38c04286c4d5e6b5c5a03e627c0e3ac))

## [1.1.39](https://github.com/wessberg/rollup-plugin-ts/compare/v1.1.38...v1.1.39) (2019-03-19)

### Bug Fixes

- **bug:** fixes an issue with babel where applying minification-related plugins could lead to syntax errors ([2a91b7f](https://github.com/wessberg/rollup-plugin-ts/commit/2a91b7fc9ed4c21236e7de40cb256034c95f9938))

## [1.1.38](https://github.com/wessberg/rollup-plugin-ts/compare/v1.1.37...v1.1.38) (2019-03-19)

### Bug Fixes

- **babel:** made it possible to babel to use the 'target' of a tsconfig without a browserslist. Made it possible to resolve tslib and babel helpers without additional resolver plugins ([76fd8a3](https://github.com/wessberg/rollup-plugin-ts/commit/76fd8a30bb6f814b790247a76c18645144c377e4))

## [1.1.37](https://github.com/wessberg/rollup-plugin-ts/compare/v1.1.36...v1.1.37) (2019-03-18)

## [1.1.36](https://github.com/wessberg/rollup-plugin-ts/compare/v1.1.35...v1.1.36) (2019-03-18)

### Features

- **option:** adds a new option 'transpileOnly' that can be toggled on to skip emitting (and checking for) diagnostics ([1a916d5](https://github.com/wessberg/rollup-plugin-ts/commit/1a916d5a1538e3df81bccfa2795b908c27cb0b62))
- **option:** adds a new option 'transpileOnly' that can be toggled on to skip emitting (and checking for) diagnostics ([90aaf8d](https://github.com/wessberg/rollup-plugin-ts/commit/90aaf8d61ae0feaa6bc5e1038b24b893fc50e9fe))

## [1.1.35](https://github.com/wessberg/rollup-plugin-ts/compare/v1.1.34...v1.1.35) (2019-03-14)

## [1.1.34](https://github.com/wessberg/rollup-plugin-ts/compare/v1.1.33...v1.1.34) (2019-02-26)

### Bug Fixes

- **bug:** don't treeshake module declarations ([a022c5d](https://github.com/wessberg/rollup-plugin-ts/commit/a022c5d7d3b1ff3582524667a5ccedaf49fcac2f))
- **bug:** fixed an issue with declarations ([fb7e2ec](https://github.com/wessberg/rollup-plugin-ts/commit/fb7e2eccbcdff75828a7009f2e78806c8333bc0b))

## [1.1.33](https://github.com/wessberg/rollup-plugin-ts/compare/v1.1.32...v1.1.33) (2019-02-26)

### Bug Fixes

- **bug:** fixes a bug where files with identical basenames, but varying extensions could lead to false positives when matching the cache under some circumstances ([28f7a09](https://github.com/wessberg/rollup-plugin-ts/commit/28f7a090cc31a724b0352026367140f884075a0a))

## [1.1.32](https://github.com/wessberg/rollup-plugin-ts/compare/v1.1.31...v1.1.32) (2019-02-26)

### Bug Fixes

- **bug:** fixes a bug where files with identical basenames, but varying extensions could lead to false positives when matching the cache under some circumstances ([b560c03](https://github.com/wessberg/rollup-plugin-ts/commit/b560c03e0fb9966ab9ebebb9144e9202518ed183))

## [1.1.31](https://github.com/wessberg/rollup-plugin-ts/compare/v1.1.30...v1.1.31) (2019-02-25)

## [1.1.30](https://github.com/wessberg/rollup-plugin-ts/compare/v1.1.29...v1.1.30) (2019-02-25)

## [1.1.29](https://github.com/wessberg/rollup-plugin-ts/compare/v1.1.28...v1.1.29) (2019-02-25)

### Bug Fixes

- **bug:** adds support for missing node types ([b5de5ee](https://github.com/wessberg/rollup-plugin-ts/commit/b5de5ee3fde857975039795081c550bb34e34af9))
- **bug:** adds support for missing node types ([608d38d](https://github.com/wessberg/rollup-plugin-ts/commit/608d38d222403b406cfe2b3f95b4419cc84d0a82))
- **bug:** adds support for missing node types ([9079f2d](https://github.com/wessberg/rollup-plugin-ts/commit/9079f2d63ac6c04aa0b007fa74604dba18ac5b22))
- **bug:** adds support for missing node types ([6a90228](https://github.com/wessberg/rollup-plugin-ts/commit/6a90228a992bebf976d134015348f4f90c048cfe))
- **bug:** fixes an issue where named exports could be removed under some circumstances ([322df0c](https://github.com/wessberg/rollup-plugin-ts/commit/322df0ccca24d66cd90af89e2b8d20ed8e9350f8))
- **bug:** fixes an issue with ExportAssignmens ([cafa7ad](https://github.com/wessberg/rollup-plugin-ts/commit/cafa7adcf6aae1be82bd3abe2d2deabbbf71dff8))

### Features

- **declarations:** far improved support for default exports/imports while bundling declarations across chunks ([4ad18d2](https://github.com/wessberg/rollup-plugin-ts/commit/4ad18d20ae0285f4008413f7a27b683402e5e27d))

## [1.1.28](https://github.com/wessberg/rollup-plugin-ts/compare/v1.1.27...v1.1.28) (2019-02-06)

### Bug Fixes

- **declarations:** fixes an issue with generating declarations ([1f93b05](https://github.com/wessberg/rollup-plugin-ts/commit/1f93b05d8de21ec56b175110bd18d1ac276aa7bb))

## [1.1.27](https://github.com/wessberg/rollup-plugin-ts/compare/v1.1.26...v1.1.27) (2019-02-06)

## [1.1.26](https://github.com/wessberg/rollup-plugin-ts/compare/v1.1.25...v1.1.26) (2019-02-06)

### Bug Fixes

- **declarations:** fixes an issue with detecting the entry file name for a chunk ([7786000](https://github.com/wessberg/rollup-plugin-ts/commit/77860003d9bf8d52980db616554a23585b774f0e))

## [1.1.25](https://github.com/wessberg/rollup-plugin-ts/compare/v1.1.24...v1.1.25) (2019-02-06)

### Bug Fixes

- **declarations:** fixes an issue with detecting the entry file name for a chunk ([01cc892](https://github.com/wessberg/rollup-plugin-ts/commit/01cc89234100484207d944518ff43bd4bc407f69))

## [1.1.24](https://github.com/wessberg/rollup-plugin-ts/compare/v1.1.23...v1.1.24) (2019-02-06)

### Bug Fixes

- **bug:** fixes a bug that could lead to misaligned content replacements ([d40ddbf](https://github.com/wessberg/rollup-plugin-ts/commit/d40ddbf21a234b4fddadd4c86e024f21df50bbb9))

## [1.1.23](https://github.com/wessberg/rollup-plugin-ts/compare/v1.1.22...v1.1.23) (2019-02-06)

### Bug Fixes

- **declarations:** fixes a variety of issues with generating declarations related to type-only files not being parsed in the declaration-emition phase ([50310ae](https://github.com/wessberg/rollup-plugin-ts/commit/50310ae594bd98b8aa46c2f31459067c6bbe80e4))
- **declarations:** fixes an issue that arose with Rollup v1 where type-only files would not be part of the modules of emitted chunks. ([043ae50](https://github.com/wessberg/rollup-plugin-ts/commit/043ae50b820a1340b47f710bc2a74bb45e0e3074))

## [1.1.22](https://github.com/wessberg/rollup-plugin-ts/compare/v1.1.21...v1.1.22) (2019-02-04)

### Bug Fixes

- **declarations:** fixes an issue with generating declarations when ImportTypeNodes are being used ([493d8b1](https://github.com/wessberg/rollup-plugin-ts/commit/493d8b17bb4592fdb2bd20cba9984e12a2638508))
- **dependencies:** updates dependencies ([ff72436](https://github.com/wessberg/rollup-plugin-ts/commit/ff72436ca78258c4b2fe11deb7048519ac55982e))

## [1.1.21](https://github.com/wessberg/rollup-plugin-ts/compare/v1.1.20...v1.1.21) (2019-01-27)

### Bug Fixes

- **package:** adds back tslib as a hard dependency ([e6bcf1c](https://github.com/wessberg/rollup-plugin-ts/commit/e6bcf1c99a59e81b62a3379f773bbe3e1a579182))

## [1.1.20](https://github.com/wessberg/rollup-plugin-ts/compare/v1.1.19...v1.1.20) (2019-01-24)

### Bug Fixes

- **package:** removes unneeded scripts ([43a4c0d](https://github.com/wessberg/rollup-plugin-ts/commit/43a4c0d41b014013fcb13069c8c1c98fbcefbff4))

## [1.1.19](https://github.com/wessberg/rollup-plugin-ts/compare/v1.1.18...v1.1.19) (2019-01-24)

### Bug Fixes

- **bug:** fixes an issue where default exports would be removed from declaration files ([c2c18ed](https://github.com/wessberg/rollup-plugin-ts/commit/c2c18ed72ec96f6d342975e1c1abb114cd9138b6))
- **package:** adds pretty-quick to commit hooks ([c07c616](https://github.com/wessberg/rollup-plugin-ts/commit/c07c6168bf8c60baf883ce6ddafd91fbb2d096d0))
- **package:** removes unneeded scripts ([4275919](https://github.com/wessberg/rollup-plugin-ts/commit/4275919857acb56279ec90e47b5cf00723331bb1))

## [1.1.18](https://github.com/wessberg/rollup-plugin-ts/compare/v1.1.17...v1.1.18) (2019-01-17)

### Bug Fixes

- **bug:** fixes an issue where 'default' keywords would not be stripped from nodes for which the 'export' keyword had been removed ([ff0233e](https://github.com/wessberg/rollup-plugin-ts/commit/ff0233e33461d52926aa4496c741b04805cf1abc))

## [1.1.17](https://github.com/wessberg/rollup-plugin-ts/compare/v1.1.16...v1.1.17) (2019-01-02)

## [1.1.16](https://github.com/wessberg/rollup-plugin-ts/compare/v1.1.15...v1.1.16) (2018-12-30)

## [1.1.15](https://github.com/wessberg/rollup-plugin-ts/compare/v1.1.14...v1.1.15) (2018-12-30)

### Bug Fixes

- **chore:** updated to Rollup v1.0.0 ([e20e5b0](https://github.com/wessberg/rollup-plugin-ts/commit/e20e5b0652ba473d8140a509b91753cc740ae6bc))

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

- **performance and interoperability:** improves performance and interoperability ([53e1eba](https://github.com/wessberg/rollup-plugin-ts/commit/53e1eba2d9e8e6bb7064836aadb0d4c9d1c6ec86))

## [1.0.12](https://github.com/wessberg/rollup-plugin-ts/compare/1.0.12...v1.0.12) (2018-10-28)

## [1.0.11](https://github.com/wessberg/rollup-plugin-ts/compare/v1.0.10...v1.0.11) (2018-10-28)

### Features

- **declarations:** improves declaration (.d.ts) generation by a huge margin. ([348ff9f](https://github.com/wessberg/rollup-plugin-ts/commit/348ff9f617787073a6b78a7e1c117ee1b0af939d))

## [1.0.10](https://github.com/wessberg/rollup-plugin-ts/compare/v1.0.9...v1.0.10) (2018-10-24)

## [1.0.9](https://github.com/wessberg/rollup-plugin-ts/compare/v1.0.8...v1.0.9) (2018-10-23)

### Bug Fixes

- fixes issues with tracking type-only files via Rollup ([da20aa2](https://github.com/wessberg/rollup-plugin-ts/commit/da20aa2ee9d37643f78ff215db7d95590c85d683)), closes [#5](https://github.com/wessberg/rollup-plugin-ts/issues/5)

## [1.0.8](https://github.com/wessberg/rollup-plugin-ts/compare/v1.0.7...v1.0.8) (2018-10-18)

## [1.0.7](https://github.com/wessberg/rollup-plugin-ts/compare/v1.0.6...v1.0.7) (2018-10-18)

## [1.0.6](https://github.com/wessberg/rollup-plugin-ts/compare/v1.0.5...v1.0.6) (2018-10-18)

### Bug Fixes

- **release:** Added 'files' array to package.json ([b5f16bf](https://github.com/wessberg/rollup-plugin-ts/commit/b5f16bf39a83855b8d7aac000ca830554ec402a8))

## [1.0.5](https://github.com/wessberg/rollup-plugin-ts/compare/v1.0.4...v1.0.5) (2018-10-18)

### Bug Fixes

- **bug:** Fixed an issue where declaration files found within a project directory wouldn't be discovered. ([719d5bd](https://github.com/wessberg/rollup-plugin-ts/commit/719d5bd5cc4c594020a6948ef165d48af8ab3893))

## [1.0.4](https://github.com/wessberg/rollup-plugin-ts/compare/v1.0.3...v1.0.4) (2018-10-18)

### Features

- **interface:** Interfaces for Plugin input options are now exported ([b50683d](https://github.com/wessberg/rollup-plugin-ts/commit/b50683d3b69b3d98161fefb442ab4e8d74f73b12))

## [1.0.3](https://github.com/wessberg/rollup-plugin-ts/compare/v1.0.2...v1.0.3) (2018-10-18)

### Features

- **interface:** Interfaces for Plugin input options are now exported ([a594de5](https://github.com/wessberg/rollup-plugin-ts/commit/a594de58533ea125b48b69a27425f40634f12017))

## [1.0.2](https://github.com/wessberg/rollup-plugin-ts/compare/v1.0.1...v1.0.2) (2018-10-18)

### Features

- **interface:** Interfaces for Plugin input options are now exported ([9a93738](https://github.com/wessberg/rollup-plugin-ts/commit/9a937387fe323fa5c4557919d0fb206582e76f74))

## [1.0.1](https://github.com/wessberg/rollup-plugin-ts/compare/1.0.0...v1.0.1) (2018-10-17)

### Bug Fixes

- **lint:** Fixed linting issues ([178499c](https://github.com/wessberg/rollup-plugin-ts/commit/178499c7632b1f8c297bfc06d03c3a385b809e12))

# [1.0.0](https://github.com/wessberg/rollup-plugin-ts/compare/v0.0.44...v1.0.0) (2018-10-17)

### Features

- **release:** ground-up rewrite and some changes to the public API ([e43045c](https://github.com/wessberg/rollup-plugin-ts/commit/e43045c7570510034162b742949fa622eb77adfc)), closes [#2](https://github.com/wessberg/rollup-plugin-ts/issues/2)
- Made JavaScript files resolved from the paths property inside a tsconfig be passed on to Rollup ([a1c990c](https://github.com/wessberg/rollup-plugin-ts/commit/a1c990ce193a74e648d2a7499448eda5c62efb27))

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
