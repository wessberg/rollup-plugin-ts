<!-- SHADOW_SECTION_LOGO_START -->

<div><img alt="Logo" src="https://raw.githubusercontent.com/wessberg/rollup-plugin-ts/master/documentation/asset/rollup-plugin-ts-logo.png" height="150"   /></div>

<!-- SHADOW_SECTION_LOGO_END -->

<!-- SHADOW_SECTION_DESCRIPTION_SHORT_START -->

> A TypeScript Rollup plugin that bundles declarations and respects Browserslists

<!-- SHADOW_SECTION_DESCRIPTION_SHORT_END -->

<!-- SHADOW_SECTION_BADGES_START -->

<a href="https://npmcharts.com/compare/%40wessberg%2Frollup-plugin-ts?minimal=true"><img alt="Downloads per month" src="https://img.shields.io/npm/dm/%40wessberg%2Frollup-plugin-ts.svg"    /></a>
<a href="https://www.npmjs.com/package/%40wessberg%2Frollup-plugin-ts"><img alt="NPM version" src="https://badge.fury.io/js/%40wessberg%2Frollup-plugin-ts.svg"    /></a>
<a href="https://david-dm.org/wessberg/rollup-plugin-ts"><img alt="Dependencies" src="https://img.shields.io/david/wessberg%2Frollup-plugin-ts.svg"    /></a>
<a href="https://github.com/wessberg/rollup-plugin-ts/graphs/contributors"><img alt="Contributors" src="https://img.shields.io/github/contributors/wessberg%2Frollup-plugin-ts.svg"    /></a>
<a href="https://github.com/prettier/prettier"><img alt="code style: prettier" src="https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square"    /></a>
<a href="https://opensource.org/licenses/MIT"><img alt="License: MIT" src="https://img.shields.io/badge/License-MIT-yellow.svg"    /></a>
<a href="https://www.patreon.com/bePatron?u=11315442"><img alt="Support on Patreon" src="https://img.shields.io/badge/patreon-donate-green.svg"    /></a>

<!-- SHADOW_SECTION_BADGES_END -->

<!-- SHADOW_SECTION_DESCRIPTION_LONG_START -->

## Description

<!-- SHADOW_SECTION_DESCRIPTION_LONG_END -->

This is a Rollup plugin that enables integration between Typescript, Babel, Browserslists, and Rollup.
It is first and foremost a Typescript plugin that enables full interoperability with Rollup. With it comes
very powerful bundling and tree-shaking of generated Typescript declaration files that works seamlessly with code splitting.

<!-- SHADOW_SECTION_FEATURES_START -->

### Features

<!-- SHADOW_SECTION_FEATURES_END -->

- Compiler diagnostics are correctly emitted and brought into the Rollup build lifecycle
- [Emit-less types](https://github.com/rollup/rollup-plugin-typescript/issues/28) are correctly handled
- Generation and bundling of Definition files (`.d.ts`) are supported and fully supports code splitting
- Incremental compilation is supported.
- A [Browserslist](https://github.com/browserslist/browserslist) can be provided instead of a target version of ECMAScript such that your code is transpiled in relation to the baseline of browsers defined in your Browserslist instead.
- Babel can be used as the transpiler, rather than Typescript, such that Typescript handles diagnostics, declarations, and stripping away types, and Babel is used for syntax transformation.

<!-- SHADOW_SECTION_FEATURE_IMAGE_START -->

<!-- SHADOW_SECTION_FEATURE_IMAGE_END -->

<!-- SHADOW_SECTION_TOC_START -->

## Table of Contents

- [Description](#description)
  - [Features](#features)
- [Table of Contents](#table-of-contents)
- [Install](#install)
  - [npm](#npm)
  - [Yarn](#yarn)
  - [pnpm](#pnpm)
  - [Peer Dependencies](#peer-dependencies)
- [Usage](#usage)
  - [Using it with just Typescript](#using-it-with-just-typescript)
    - [Typescript and tslib helpers](#typescript-and-tslib-helpers)
  - [Combining Typescript with a Browserslist](#combining-typescript-with-a-browserslist)
    - [Using the plugin with Typescript, but without Browserslists](#using-the-plugin-with-typescript-but-without-browserslists)
  - [Combining Typescript with Babel](#combining-typescript-with-babel)
    - [Special handling for minification plugins/presets](#special-handling-for-minification-pluginspresets)
    - [`@babel/runtime` and external helpers](#babelruntime-and-external-helpers)
    - [`@babel/runtime` and polyfills](#babelruntime-and-polyfills)
  - [Using `CustomTransformers`](#using-customtransformers)
- [Declaration files](#declaration-files)
- [Examples](#examples)
  - [Pure Typescript example](#pure-typescript-example)
  - [Typescript with Browserslist example](#typescript-with-browserslist-example)
  - [Typescript, Babel, and Browserslist example](#typescript-babel-and-browserslist-example)
  - [Pure Typescript with CustomTransformers](#pure-typescript-with-customtransformers)
  - [Advanced example of using Typescript, Babel, and Browserslists together](#advanced-example-of-using-typescript-babel-and-browserslists-together)
  - [Passing a specific TypeScript version](#passing-a-specific-typescript-version)
- [Hooks](#hooks)
  - [The `outputPath` hook](#the-outputpath-hook)
  - [The `diagnostics` hook](#the-diagnostics-hook)
  - [The `declarationStats` hook](#the-declarationstats-hook)
    - [The `externalTypes` property for `DeclarationChunkStats`](#the-externaltypes-property-for-declarationchunkstats)
- [Full list of plugin options](#full-list-of-plugin-options)
  - [`transpiler`](#transpiler)
  - [`babelConfig`](#babelconfig)
  - [`tsconfig`](#tsconfig)
  - [`browserslist`](#browserslist)
  - [`cwd`](#cwd)
  - [`typescript`](#typescript)
  - [`transformers`](#transformers)
  - [`include`](#include)
  - [`exclude`](#exclude)
  - [`transpileOnly`](#transpileonly)
  - [`fileSystem`](#filesystem)
  - [`hook`](#hook)
- [Ignored/overridden options](#ignoredoverridden-options)
  - [Ignored/overridden TypeScript options](#ignoredoverridden-typescript-options)
    - [Behavior of esModuleInterop](#behavior-of-esmoduleinterop)
  - [Ignored/overridden Babel options](#ignoredoverridden-babel-options)
  - [Default Babel plugins](#default-babel-plugins)
- [Contributing](#contributing)
- [Maintainers](#maintainers)
- [Backers](#backers)
  - [Patreon](#patreon)
- [FAQ](#faq)
  - [Does this plugin work with Code Splitting?](#does-this-plugin-work-with-code-splitting)
  - [Why wouldn't you use just TypeScript?](#why-wouldnt-you-use-just-typescript)
  - [Okay, then why wouldn't you use just babel?](#okay-then-why-wouldnt-you-use-just-babel)
  - [When combined with Babel, what does TypeScript do, and what does Babel do?](#when-combined-with-babel-what-does-typescript-do-and-what-does-babel-do)
  - [Why is @babel/plugin-transform-runtime and tslib included by default?](#why-is-babelplugin-transform-runtime-and-tslib-included-by-default)
- [Starter templates](#starter-templates)
- [License](#license)

<!-- SHADOW_SECTION_TOC_END -->

<!-- SHADOW_SECTION_INSTALL_START -->

## Install

### npm

```
$ npm install @wessberg/rollup-plugin-ts --save-dev
```

### Yarn

```
$ yarn add @wessberg/rollup-plugin-ts --dev
```

### pnpm

```
$ pnpm add @wessberg/rollup-plugin-ts --save-dev
```

### Peer Dependencies

`@wessberg/rollup-plugin-ts` depends on `rollup` and `typescript`, so you need to manually install these as development dependencies as well.

<!-- SHADOW_SECTION_INSTALL_END -->

<!-- SHADOW_SECTION_USAGE_START -->

## Usage

<!-- SHADOW_SECTION_USAGE_END -->

Using the plugin is as simple as it can be. Here's an example within a Rollup config:

```javascript
import ts from "@wessberg/rollup-plugin-ts";
export default {
	// ...
	plugins: [
		ts({
			/* Plugin options */
		})
	]
};
```

Without any options, the plugin will _"just work"_:

- The `tsconfig.json` file closest to the current working directory will be resolved, if any. Otherwise, the default Typescript options will be used.
- The `.browserslistrc` file or `browserslist` property within the `package.json` file closest to the current working directory will be resolved and used to decide the Typescript ECMAScript version target, if any. Otherwise, the declared `target` within the resolved `tsconfig.json` file will be used, if any such file exists, and if not, the default Typescript target will be used.

### Using it with just Typescript

This plugin works very well with just Typescript.
The `tsconfig.json` file closest to your project will be resolved and used in combination with Rollup.
If your config has a different name, or if you use different configs dynamically depending on the environment, you can provide the location for the `tsconfig` in the plugin options:

```javascript
ts({
	tsconfig: PRODUCTION ? "tsconfig.prod.json" : "tsconfig.json"
});
```

You an also pass in [CompilerOptions](https://www.typescriptlang.org/docs/handbook/compiler-options.html) directly, rather than provide the path to a `tsconfig`:

```javascript
ts({
	tsconfig: {
		target: ScriptTarget.ES2018,
		allowSyntheticDefaultImports: true,
		allowJs: true
	}
});
```

You can also pass in a function that receives whatever `CompilerOptions` that could be resolved relative to the current working directory, but then allow you to override the options:

```javascript
ts({
	tsconfig: resolvedConfig => ({...resolvedConfig, allowJs: false})
});
```

The above example is based on the assumption that a file can be resolved with the name `tsconfig.json`, and if not, the Typescript's default `CompilerOptions` will be used.
But if you want to provide the name of the `tsconfig` to override, you can also pass in an object following the following form:

```javascript
ts({
	tsconfig: {
		fileName: "my-awesome-tsconfig.json",
		hook: resolvedConfig => ({...resolvedConfig, allowJs: false})
	}
});
```

If there is a `.browserslistrc` file or the nearest `package.json` contains a Browserslist configuration, a target ECMAScript version will be decided based on that one, rather than respecting the `target` property of the matched `tsconfig`.
If you do not want this behavior, you can [disable it as described here](#using-the-plugin-with-typescript-but-without-browserslists).

#### Typescript and tslib helpers

This plugin makes sure that the helper functions that may be emitted within the output generated by Typescript will not be duplicated across files and chunks. Instead, they will automatically be divided into chunks and imported across Rollup chunks.
You don't have to do anything!

### Combining Typescript with a Browserslist

If there is a `.browserslistrc` file or the nearest `package.json` contains a Browserslist configuration, this is the default behavior! Rather than use the `target` property of the nearest `tsconfig`, it will be decided based on the Browserslist.

You can explicitly pass in Browserslist options. Here's an example with a raw Browserslist query:

```javascript
ts({
	browserslist: ["last 1 version", "> 1%"]
});
```

You can also provide a configuration object instead of a raw query. Here's one with a baked-in query:

```javascript
ts({
	browserslist: {
		query: ["last 1 version", "> 1%"]
	}
});
```

...And here's one with a `path` property pointing to a file that contains a Browserslist:

```javascript
ts({
	browserslist: {
		path: ".mybrowserslistrc"
	}
});
```

#### Using the plugin with Typescript, but without Browserslists

If no Browserslist can be found, or if you simply don't want to use one, that's completely OK!
In such cases, the `target` property of the nearest `tsconfig` will be used (or use the Typescript default setting if no such file exists).

You can explicitly request that no Browserslist will be used by setting the `browserslist` property to `false` in the plugin options:

```javascript
ts({
	browserslist: false
});
```

### Combining Typescript with Babel

This plugin makes it really easy to use Typescript for reporting diagnostics, generating declaration files, and stripping types, but then using Babel for all other syntax transformations.
One very strong use case for this is to use [`@babel/preset-env`](https://babeljs.io/docs/en/babel-preset-env). Another one is that you get the entire ecosystem of Babel plugins at your disposal.

To use Babel, simply set the `transpiler` plugin option to `"babel"`:

```javascript
ts({
	transpiler: "babel"
});
```

That's it! The plugin will attempt to locate a `babel.config.js` file or a `.babelrc` file and use the options, plugins, and presets found there.
By default, some combination of presets and plugins will be applied depending on the config options you provide. See [this section](#default-babel-plugins) for more details.

#### Special handling for minification plugins/presets

This plugin will apply syntax transformations from Babel presets and plugins on a file-by-file basis. However, if a a minification-related plugin or preset such as [babel-preset-minify](https://github.com/babel/minify/tree/master/packages/babel-preset-minify) is found within the Babel options,
these transformations will be applied per chunk. This enables the minification presets and plugins to perform better as it can now mangle in relation to the entire chunk and better remove unwanted characters such as whitespace.
All of this works automatically.

#### `@babel/runtime` and external helpers

This plugin will automatically make sure to avoid duplication of emitted Babel helpers. Rollup will automatically split these into chunks and re-use them across the chunks that Rollup generates.
You don't have to do anything.

#### `@babel/runtime` and polyfills

Babel supports injecting polyfills where needed and in relation to the target environment. By default, this plugin **will not** add polyfills to your chunks since there are arguably better ways of applying polyfills such as lazy-loading depending on feature support or using something like [Polyfill.app](https://github.com/wessberg/polyfiller).
If you would like this behavior, simply add either `@babel/plugin-transform-runtime` to your Babel config with the `corejs` option set to true, or add `@babel/preset-env` to your Babel config with the `useBuiltIns` option set to `usage`.

### Using `CustomTransformers`

This plugin enables you to pass in [`CustomTransformers`](https://github.com/Microsoft/TypeScript/pull/13940) which allows you to transform the Typescript AST during code transpilation.
This enables you to very efficiently transform Typescript before code generation and additionally enables you to use this plugin with tools that leverage this, such as some modern web frameworks and libraries do.

## Declaration files

Typescript declaration files are normally distributed in a folder structure that resembles the structure of the source folder.
With `tsc`, you would get something like this:

<img alt="TSC emitted code" src="https://raw.githubusercontent.com/wessberg/rollup-plugin-ts/master/documentation/asset/tsc-output-example.png" height="250"   />

Rollup is a bundler, and with it, we can produce clean, small files that are easy to distribute.
With `rollup-plugin-ts`, declaration files will be bundled, tree-shaken and emitted alongside the chunks emitted by Rollup:

<img alt="Plugin emitted code" src="https://raw.githubusercontent.com/wessberg/rollup-plugin-ts/master/documentation/asset/plugin-output-example.png" height="250"   />

And, it even works in complex code splitting scenarios:

<img alt="Plugin emitted code with code splitting" src="https://raw.githubusercontent.com/wessberg/rollup-plugin-ts/master/documentation/asset/plugin-output-example-code-splitting.png" height="250"   />

## Examples

### Pure Typescript example

```javascript
ts({
	// If your tsconfig is already called 'tsconfig.json', this option can be left out
	tsconfig: "tsconfig.json",
	// If there is no .browserslistrc within your project, and if your package.json doesn't include a Browserslist property, this option can be left out
	browserslist: false
});
```

### Typescript with Browserslist example

[As described here](#combining-typescript-with-a-browserslist), by default, the plugin will attempt to locate a Browserslist automatically. This example
shows how you can provide one explicitly

```javascript
ts({
	browserslist: ["last 1 version", "> 1%"]
});

// or
ts({
	browserslist: {path: ".mybrowserslistrc"}
});
```

### Typescript, Babel, and Browserslist example

[As described here](#combining-typescript-with-babel), a `babel.config.js` or `.babelrc` file will automatically be found by the plugin if available. This example shows how you can provide one explicitly.
And, [as described here](#typescript-with-browserslist-example), the same goes for Browserslists.

```javascript
ts({
	transpiler: "babel",
	browserslist: ["last 1 version", "> 1%"],
	babelConfig: {
		plugins: ["my-babel-plugin"]
	}
});
```

### Pure Typescript with CustomTransformers

```javascript
ts({
	transformers: {
		before: [myTransformer1, myTransformer2],
		after: [myTransformer3, myTransformer4],
		afterDeclarations: [myTransformer5, myTransformer6]
	}
});
```

### Advanced example of using Typescript, Babel, and Browserslists together

This example shows how you can use this plugin to accomplish quite advanced things:

```javascript
const IS_PRODUCTION = process.env.NODE_ENV === "production";
const BUNDLE_TARGET = process.env.BUNDLE_TARGET;
const APP_ROOT = "/some/project/root/folder";
const awesomeFrameworkTransformers = getAwesomeFrameworkCustomTransformers();

ts({
	// Use Babel for Syntax transformations
	transpiler: "babel",
	// Don't use process.cwd(), but instead another root directory
	cwd: APP_ROOT,
	// Load a different tsconfig file in production
	tsconfig: IS_PRODUCTION ? "tsconfig.prod.json" : "tsconfig.json",
	// Load a different browserslist if currently targeting a modern environment
	browserslist: {
		path: BUNDLE_TARGET === "modern" ? ".browserlistrc-modern" : ".browserslistrc-legacy"
	},
	// Load a different babel config file in production
	babelConfig: IS_PRODUCTION ? "babel.config.prod.js" : "babel.config.js",

	// Exclude files within node_modules when not in production
	exclude: IS_PRODUCTION ? [] : ["node_modules/**/*.*"],

	// Apply CustomTransformers, for example to transform the Source Code with a framework that uses some
	transformers: awesomeFrameworkTransformers
});
```

### Passing a specific TypeScript version

You can use pass a specific TypeScript to use as an option. This may be useful if you are using different TypeScript versions across packages inside a monorepo and you want to use a specific one with `rollup-plugin-ts`:

```typescript
ts({
	typescript: specialTypescriptVersion
});
```

## Hooks

`rollup-plugin-ts` provides a few hooks that allow you to hook into and augment the internal behavior of the plugin.

These can be provided in the plugin options for the `hook` property:

```typescript
ts({
	hook: {
		// Add hooks here
	}
});
```

The next few subsections describe the different hooks that can be provided

### The `outputPath` hook

Type: `(path: string, kind: "declaration" | "declarationMap" | "buildInfo") => string | undefined`

The `outputPath` hook can be used to rewrite the location on the filesystem that assets produced by `rollup-plugin-ts` are written to.
It is invoked immediately before assets such as _declarations_ or _declaration maps_ are emitted.

The hook is invoked with the output path as well as the kind of asset the path represents as arguments.
If you return a `string` from the hook, the alternative location will be used instead. If you return undefined, the current path will be used.

```typescript
ts({
	hook: {
		outputPath: (path, kind) => rewritePathSomehow(path, kind)
	}
});
```

For example, the `path` may be `/some/path/index.d.ts`, and `kind` be `declaration`, and you might want to rewrite this to `/some/path/my-typings.d.ts`.

### The `diagnostics` hook

Type: `(diagnostics: readonly Diagnostic[]) => readonly Diagnostic[]|undefined`

The `diagnostics` hook can be used to read, alter, and extend the diagnostics generated by TypeScript immediately before they are emitted as errors via Rollup.
Normally, Rollup will crash on the first discovered error, but there may be several diagnostics, all of which may be of interest to you. This hook gives you access to all of them.

You can also use this hook if you want to silence specific kinds of Diagnostics or even add your own.

### The `declarationStats` hook

Type: `(stats: DeclarationStats) => DeclarationStats|undefined`

The `declarationStats` hook can be used to get relevant stats produced while bundling declarations.
The hook calls the given callback with a stats object as the first argument.
The stats object has the following type information:

```typescript
// A Record from chunk file names to their stats
type DeclarationStats = Record<string, DeclarationChunkStats>;

interface DeclarationChunkStats {
	// An array of the external type dependencies for a declaration chunk
	externalTypes: ExternalType[];
}

interface ExternalType {
	// The name of the external library that provides the typings. For example, "typescript" or "@types/node"
	library: string;
	// The version of the referenced external library
	version: string;
}
```

##### The `externalTypes` property for `DeclarationChunkStats`

The `externalTypes` property of declaration chunk stats objects can be useful, for example, if you want to get a hook into which external type dependencies that remain
after bundling and tree-shaking and that you should declare as `dependencies` of your library.

Here's an example of how you might use the hook:

```typescript
ts({
	hook: {
		declarationStats: declarationStats => console.log(declarationStats)
	}
});
```

The example above could log something like the following to the console:

```typescript
{
  "index.d.ts": {
    externalTypes: [
      { library: "typescript", version: "3.9.2" },
      { library: "@types/node", version: "14.0.26" }
    ]
  },
  "some-other-chunk.d.ts": {
    externalTypes: [
      { library: "some-other-external-library", version: "1.2.3" }
    ]
  }
}
```

This gives you an easy way to track which external type dependencies remain in your bundled and tree-shaken declarations and that should be declared as dependencies of your library.

## Full list of plugin options

The plugin options are documented in more detail across this README, but the full list of options is:

#### `transpiler`

Type: `"typescript" | "babel"`

Can be any of `"babel"` or `"typescript"` (default: `"typescript"`).
See [this section](#combining-typescript-with-babel) and [this section](#when-combined-with-babel-what-does-typescript-do-and-what-does-babel-do) for details on how `rollup-plugin-ts` works when `"babel"` is being used as a transpiler.

#### `babelConfig`

Type: `string | Partial<IBabelInputOptions>`

This option will only be respected when `"babel"` is being used as the `transpiler` and can be used to provide a [Babel config](https://babeljs.io/docs/en/options) or a path to one.

#### `tsconfig`

Type: `string | Partial<CompilerOptions> | Partial<Record<keyof CompilerOptions, string | number | boolean>> | ParsedCommandLine | TsConfigResolver | TsConfigResolverWithFileName`

Provide the TypeScript [CompilerOptions](https://www.typescriptlang.org/docs/handbook/compiler-options.html) to use, or a path to a `tsconfig` with this property.
See [this section](#using-it-with-just-typescript) for details on the many ways this property can be configured.

#### `browserslist`

Type: `false | string[] | string | BrowserslistConfig`

Provide the [Browserslist](https://github.com/browserslist/browserslist) to use, or a path to a `.browserslistrc` with this property.
See [this section](#combining-typescript-with-a-browserslist) for details on the many ways this property can be configured.

#### `cwd`

Type: `string`

Use this property to overwrite whatever is considered the root directory. The default value is `process.cwd()`.

#### `typescript`

Type: `typeof import("typescript")`

Use this property to pass a specific version of TypeScript to use.

#### `transformers`

Type: `(CustomTransformers | CustomTransformersFunction)[] | CustomTransformers | CustomTransformersFunction`

Use this property to provide TypeScript [`CustomTransformers`](https://github.com/Microsoft/TypeScript/pull/13940).
See [this section](#using-customtransformers) for more details on how to configure this property.

#### `include`

Type: `string[]|string`

This option takes a minimatch pattern or an array of minimatch patterns and only transforms files with filenames that the pattern matches.

#### `exclude`

Type: `string[]|string`

This option takes a minimatch pattern or an array of minimatch patterns and only transforms files with filenames that the pattern doesn't match.

#### `transpileOnly`

Type: `boolean`

If this option is `true`, diagnostics won't be generated. This will improve performance since TypeScript but ignores all syntactical and semantic errors or warnings that may arise.

#### `fileSystem`

Optionally the [FileSystem](https://github.com/wessberg/rollup-plugin-ts/blob/master/src/util/file-system/file-system.ts) to use. This is useful for example when you want to provide a virtual FileSystem to read from or write to.

#### `hook`

Use this property to get hooks into the internals of `rollup-plugin-ts`.
See [this section](#hooks) for more details.

## Ignored/overridden options

TypeScript and Babel are powerful tools in their own right. Combined with Rollup, they become even more powerful.
To provide a seamless experience, Rollup always take precedence when conflicts arise. As a natural consequence of this, some options provided to TypeScript and Babel will be ignored or overridden.

### Ignored/overridden TypeScript options

The following [CompilerOptions](https://www.typescriptlang.org/docs/handbook/compiler-options.html) from a `tsconfig` will be ignored:

| Property              | Reason                                                                                                                                                                                                                                                                                                                                                                                     |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `outDir`              | Rollup, not TypeScript, will decide where to emit chunks.                                                                                                                                                                                                                                                                                                                                  |
| `module`              | Rollup, not TypeScript, is the decider of which module system(s) to target based on your Rollup configuration.                                                                                                                                                                                                                                                                             |
| `outFile`             | This option produces flat output and only works with the module formats AMD and SystemJS. Rollup will be the decider of how to split code.                                                                                                                                                                                                                                                 |
| `sourceMap`           | TypeScript will always be instructed to produce SourceMaps. Rollup then decides whether or not to include them (and if they should be inlined).                                                                                                                                                                                                                                            |
| `inlineSourceMap`     | TypeScript will always be instructed to produce SourceMaps. Rollup then decides whether or not to include them (and if they should be inlined).                                                                                                                                                                                                                                            |
| `inlineSources`       | Since `inlineSourceMap` is ignored, this option won't take effect.                                                                                                                                                                                                                                                                                                                         |
| `importHelpers`       | Helpers will always be imported. This makes it possible for Rollup to code-split properly and share TypeScript helpers across chunks.                                                                                                                                                                                                                                                      |
| `moduleResolution`    | Node-module resolution will always be used. This is required for `importHelpers` to work and in general, to make TypeScript able to resolve external libraries. Note that you still need to add the [nodeResolve](https://github.com/rollup/rollup-plugin-node-resolve) plugin in order to include external libraries within your bundle unless `allowJs` is `true` within your `tsconfig` |
| `noEmit`              | TypeScript should always be able to emit assets, but those will be delegated to Rollup.                                                                                                                                                                                                                                                                                                    |
| `noEmitOnError`       | See above.                                                                                                                                                                                                                                                                                                                                                                                 |
| `emitDeclarationOnly` | See above.                                                                                                                                                                                                                                                                                                                                                                                 |  |
| `noEmitHelpers`       | TypeScript should always be able to emit helpers, since the `importHelpers` option is forced                                                                                                                                                                                                                                                                                               |
| `noResolve`           | TypeScript should always be able to resolve things. Otherwise, compilation might break.                                                                                                                                                                                                                                                                                                    |
| `watch`               | Rollup, not TypeScript, will watch files if run in watch mode. Efficient caching will still be used for optimum performance.                                                                                                                                                                                                                                                               |
| `preserveWatchOutput` | See above                                                                                                                                                                                                                                                                                                                                                                                  |

The following additional options will also be ignored:

| Property  | Reason                                                                                                                                                                                                                                 |
| --------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `include` | Rollup itself will decide which files to include in the transformation process based on your code. This plugin itself takes a `include` property which you should use instead if you want to explicitly allow specific files or globs. |
| `exclude` | See above.                                                                                                                                                                                                                             |

#### Behavior of esModuleInterop

Given that Rollup, not TypeScript, is the decider of which module system(s) to target based on your Rollup configuration, TypeScript will always emit ES modules that Rollup can understand and work with.

The `esModuleInterop` option to TypeScript is respected, but its emit-characteristics won't have an impact on your bundle. Instead, you may consult [the Rollup documentation for the `interop` option](https://rollupjs.org/guide/en/#outputinterop) to achieve
the same thing with Rollup.

### Ignored/overridden Babel options

The following [Babel options](https://babeljs.io/docs/en/options) will be ignored:

| Property     | Reason                                                                                                                                                                                                                                 |
| ------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `sourceMaps` | Babel will always be instructed to produce SourceMaps. Rollup then decides whether or not to include them (and if they should be inlined).                                                                                             |
| `cwd`        | The `cwd` option provided to the plugin will always be used.                                                                                                                                                                           |
| `include`    | Rollup itself will decide which files to include in the transformation process based on your code. This plugin itself takes a `include` property which you should use instead if you want to explicitly allow specific files or globs. |
| `exclude`    | See above                                                                                                                                                                                                                              |
| `ignore`     | See above                                                                                                                                                                                                                              |
| `only`       | See above                                                                                                                                                                                                                              |
| `sourceType` | Will always use `module`. Rollup will then decide what to do based on the output format                                                                                                                                                |

### Default Babel plugins

If you decide to use Babel as the transpiler with the `transpiler` plugin option set to `"babel"`, some best-practice default plugins and presets will be applied such that you don't have to configure anything on your own.
By default, the plugin will conditionally apply the `@babel/preset-env` preset if a Browserslist is provided or located, as well as plugins for handling [shipped proposals](https://babeljs.io/docs/en/babel-preset-env#shippedproposals). And, the `@babel/plugin-runtime` plugin will be used for extracting Babel helpers and reusing them across your chunks to avoid code duplication.

If you provide these presets or plugins yourself through the found or provided Babel config, _your_ config options will take precedence.

Here's table with a full overview of the specifics:

| Preset/Plugin                                      | Condition                                                                                                              | Reason                                                                                                                                                                                                                                                                                                                                                                                                   |
| -------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `@babel/preset-env`                                | A Browserslist is provided or found automatically, and you don't provide this preset yourself within your Babel config | This preset enables you to base your syntax transformations on the specific browsers/environment you want your application or library to target. It will "_Just Work"_                                                                                                                                                                                                                                   |
| `@babel/plugin-transform-runtime`                  | You don't provide this plugin yourself within your Babel config                                                        | Depending on your configuration, async functions may be rewritten to use [Regenerator Runtime](https://github.com/facebook/regenerator/tree/master/packages/regenerator-runtime), and there may be one or more Babel helpers injected within your code. `@babel/plugin-runtime` allows this plugin to avoid duplicating these helpers, and instead make them shared across Chunks seamlessly via Rollup. |
| `@babel/plugin-proposal-object-rest-spread`        | You don't provide this plugin yourself within your Babel config                                                        | This plugin is needed in order to enable parsing [Object Rest/Spread](https://github.com/tc39/proposal-object-rest-spread) syntax, something that is a Stage 4 proposal for ECMAScript and [will be part of ES2018](https://github.com/tc39/proposals/blob/master/finished-proposals.md).                                                                                                                |
| `@babel/plugin-proposal-async-generator-functions` | You don't provide this plugin yourself within your Babel config                                                        | This plugin is needed in order to support [Asynchronous Iteration](https://github.com/tc39/proposal-async-iteration) syntax, something that is a Stage 4 proposal for ECMAScript and [will be part of ES2018](https://github.com/tc39/proposals/blob/master/finished-proposals.md).                                                                                                                      |
| `@babel/plugin-proposal-optional-catch-binding`    | You don't provide this plugin yourself within your Babel config                                                        | This plugin is needed in order to support [Optional Catch Binding](https://github.com/tc39/proposal-optional-catch-binding) syntax, something that is a Stage 4 proposal for ECMAScript and [will be part of ES2019](https://github.com/tc39/proposals/blob/master/finished-proposals.md).                                                                                                               |
| `@babel/plugin-proposal-unicode-property-regex`    | You don't provide this plugin yourself within your Babel config                                                        | This plugin is needed in order to support [RegExp Unicode Property Escapes](https://github.com/tc39/proposal-regexp-unicode-property-escapes) syntax, something that is a Stage 4 proposal for ECMAScript and [will be part of ES2018](https://github.com/tc39/proposals/blob/master/finished-proposals.md).                                                                                             |
| `@babel/plugin-proposal-json-strings`              | You don't provide this plugin yourself within your Babel config                                                        | This plugin is needed in order to support [JSON superset](https://github.com/tc39/proposal-json-superset) syntax, something that is a Stage 4 proposal for ECMAScript and [will be part of ES2019](https://github.com/tc39/proposals/blob/master/finished-proposals.md).                                                                                                                                 |

<!-- SHADOW_SECTION_CONTRIBUTING_START -->

## Contributing

Do you want to contribute? Awesome! Please follow [these recommendations](./CONTRIBUTING.md).

<!-- SHADOW_SECTION_CONTRIBUTING_END -->

<!-- SHADOW_SECTION_MAINTAINERS_START -->

## Maintainers

| <a href="mailto:frederikwessberg@hotmail.com"><img alt="Frederik Wessberg" src="https://avatars2.githubusercontent.com/u/20454213?s=460&v=4" height="70"   /></a>                                                                |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [Frederik Wessberg](mailto:frederikwessberg@hotmail.com)<br><strong>Twitter</strong>: [@FredWessberg](https://twitter.com/FredWessberg)<br><strong>Github</strong>: [@wessberg](https://github.com/wessberg)<br>_Lead Developer_ |

<!-- SHADOW_SECTION_MAINTAINERS_END -->

<!-- SHADOW_SECTION_BACKERS_START -->

## Backers

[Become a sponsor/backer](https://github.com/wessberg/rollup-plugin-ts?sponsor=1) and get your logo listed here.

| <a href="https://usebubbles.com"><img alt="Bubbles" src="https://uploads-ssl.webflow.com/5d682047c28b217055606673/5e5360be16879c1d0dca6514_icon-thin-128x128%402x.png" height="70"   /></a> | <a href="https://github.com/cblanc"><img alt="Christopher Blanchard" src="https://avatars0.githubusercontent.com/u/2160685?s=400&v=4" height="70"   /></a> |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [Bubbles](https://usebubbles.com)<br><strong>Twitter</strong>: [@use_bubbles](https://twitter.com/use_bubbles)                                                                              | [Christopher Blanchard](https://github.com/cblanc)                                                                                                         |

### Patreon

<a href="https://www.patreon.com/bePatron?u=11315442"><img alt="Patrons on Patreon" src="https://img.shields.io/endpoint.svg?url=https://shieldsio-patreon.herokuapp.com/wessberg"  width="200"  /></a>

<!-- SHADOW_SECTION_BACKERS_END -->

<!-- SHADOW_SECTION_FAQ_START -->

## FAQ

<!-- SHADOW_SECTION_FAQ_END -->

#### Does this plugin work with Code Splitting?

Absolutely, even with Declaration files. Things will work seamlessly.

#### Why wouldn't you use just TypeScript?

The TypeScript compiler, while extremely powerful, has the restriction that it can only target a specific ECMAScript version.
In reality, browsers and other ECMAScript environments has varying support for newer language features.
Some browsers support even those features that haven't been publicized yet, while others support only parts of the latest language features.

In effect, a browser may support a lot of modern features such as classes and proper lexical scoping, but lack others.
With TypeScript, it's _"all-or-nothing"_: If you want to support a Browser with partial support, you must target the latest publicized ECMAScript version that the browser fully supports.

Babel, on the other hand, is far more granular in its design and applies syntax transformations on a feature-by-feature basis.
Combined with something like `@babel/preset-env`, individual transformations can be applied for only those language features that are missing.
This means that you can use things like classes and lexical scoping in browsers that otherwise doesn't fully support all of the ES2015 specification.

#### Okay, then why wouldn't you use just babel?

Babel has recently received support for [parsing and transforming TypeScript](https://babeljs.io/docs/en/babel-plugin-transform-typescript). It would be intriguing to just use Babel for everything. However, there are significant caveats:

The Babel compiler works on a file-by-file basis, meaning it is simple to use and reason about, whereas the TypeScript compiler works with _Programs_, or in other words sets of related _SourceFiles_.
This gives TypeScript the advantage over Babel that it has a greater understanding of your codebase in general and can understand your types across files.
In the context of this plugin, this enables TypeScript to do things that you simply wouldn't be able to do with the TypeScript plugin for Babel:

1. Emit TypeScript diagnostics
2. Emit TypeScript declaration (`.d.ts`) files and TypeScript declaration map (`.d.ts.map`) files.
3. Remove type-only imports that wouldn't otherwise be transformed by Rollup and would lead to issues like [this one](https://github.com/rollup/rollup-plugin-typescript/issues/28)
4. Use `const enums` and all other files that will require type information.

#### When combined with Babel, what does TypeScript do, and what does Babel do?

First, TypeScript will be used for:

1. Reporting diagnostics.
2. Emitting TypeScript declaration (`.d.ts`) files and TypeScript declaration map (`.d.ts.map`) files.
3. Removing TypeScript-specific features such as types, type-only imports, enums, and TypeScript decorators.

Babel will then be used for all other syntax transformation from then on, depending on the combination of default, provided, and forced presets and plugins.

#### Why is @babel/plugin-transform-runtime and tslib included by default?

[See this explainer](./documentation/explainer/why_is_babel-plugin-transform-runtime_and_tslib_included_by_default.md).

## Starter templates

The following is an evolving list of starter templates for new projects using Rollup, TypeScript, and `@wessberg/rollup-plugin-ts` that you can take a look at and draw inspiration from.

- [Library with CommonJS and ESM output and TypeScript declarations](https://repl.it/@wessberg/rollup-plugin-ts-library-cjs-esm-declarations-1)

<!-- SHADOW_SECTION_LICENSE_START -->

## License

MIT © [Frederik Wessberg](mailto:frederikwessberg@hotmail.com) ([@FredWessberg](https://twitter.com/FredWessberg)) ([Website](https://github.com/wessberg))

<!-- SHADOW_SECTION_LICENSE_END -->
