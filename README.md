<a href="https://npmcharts.com/compare/@wessberg/rollup-plugin-ts?minimal=true"><img alt="Downloads per month" src="https://img.shields.io/npm/dm/%40wessberg%2Frollup-plugin-ts.svg" height="20"></img></a>
<a href="https://david-dm.org/wessberg/rollup-plugin-ts"><img alt="Dependencies" src="https://img.shields.io/david/wessberg/rollup-plugin-ts.svg" height="20"></img></a>
<a href="https://www.npmjs.com/package/@wessberg/rollup-plugin-ts"><img alt="NPM Version" src="https://badge.fury.io/js/%40wessberg%2Frollup-plugin-ts.svg" height="20"></img></a>
<a href="https://github.com/wessberg/rollup-plugin-ts/graphs/contributors"><img alt="Contributors" src="https://img.shields.io/github/contributors/wessberg%2Frollup-plugin-ts.svg" height="20"></img></a>
<a href="https://opensource.org/licenses/MIT"><img alt="MIT License" src="https://img.shields.io/badge/License-MIT-yellow.svg" height="20"></img></a>
<a href="https://www.patreon.com/bePatron?u=11315442"><img alt="Support on Patreon" src="https://c5.patreon.com/external/logo/become_a_patron_button@2x.png" height="20"></img></a>

# `@wessberg/rollup-plugin-ts`

> A Rollup plugin for Typescript that respects Browserslists

## Description

This is a Rollup plugin that enables integration between Typescript and Rollup.
In comparison with the [official plugin](https://github.com/rollup/rollup-plugin-typescript), this one has several improvements:

- Compiler diagnostics are correctly emitted and brought into the Rollup build lifecycle
- [Emit-less types](https://github.com/rollup/rollup-plugin-typescript/issues/28) are correctly handled
- Generation of Definition files (`.d.ts`) are supported
- A [Browserslist](https://github.com/browserslist/browserslist) can be provided instead of a target version of ECMAScript such that your code is transpiled in relation to the baseline of browsers defined in your Browserslist instead.

## Install

### NPM

```
$ npm install @wessberg/rollup-plugin-ts
```

### Yarn

```
$ yarn add @wessberg/rollup-plugin-ts
```

### Run once with NPX

```
$ npx @wessberg/rollup-plugin-ts
```

## Usage

Using the plugin is dead-simple. Here's an example:

```javascript
import tsPlugin from "@wessberg/rollup-plugin-ts";
export default {
  // The entry point of your app or library
  input: "src/index.ts",
  output: [
    /* ... */
  ],
  plugins: [
    tsPlugin({
      /* Plugin options */
    })
  ]
};
```

The options provided in your `tsconfig.json` will be seamlessly merged with those provided by Rollup.

### Plugin options

- `tsconfig`: The relative path from the current working directory to the Typescript config file to use. (Default: `tsconfig.json`).
- `root`: The current working directory. (Default: `process.cwd()`)
- `include`: A filter for the files that should be passed through the plugin. (Default: `[]`),
- `exclude`: A filter for the files that should be excluded from being passed through the plugin. (Default: `[]`)
- `browserslist`: A Browserslist config that should be compiled against, rather than relying on the `target` provided in the `tsconfig`. Please see [this section](#using-browserslists) for more details. (Default: `undefined`)
- `babel`: An object of supported configuration options to pass on to Babel (See [this section](#babel-options) for more details.) (Default: `undefined`)
- `parseExternalModules`: If false, no external modules (e.g. those coming from `node_modules`) will be parsed by Typescript which may result in the unwanted preservation of exported types from other libraries in the compiled output. Please see [this section](#rollup-complains-about-an-import-for-something-that-isnt-exported-by-a-module) for more details. (Default: `false`)

#### Babel options

These options will be passed on to Babel. Note that you *MUST* also include a `browserslist` to the plugin in order for Babel to handle transpilation.

- `additionalPresets`: Code will additionally be run through the babel presets provided here. (Default: `undefined`)
- `additionalPlugins`: Code will additionally be run through the babel plugins provided here. (Default: `undefined`)
- `comments`: Whether or not comments will be preserved in the output. (Default: `undefined`),

### Declarations

Yup. Those work. If `declaration` is `true` in your `tsconfig`, Declaration files following the original folder structure will be generated inside the output directories.

### Using Browserslists

If you want to let a [Browserslist](https://github.com/browserslist/browserslist) decide which transformations to apply to your code, rather than a simple ECMAScript target version,
please know that the compilation phase will be two-fold:

1. The Typescript compiler will compile with `ESNext` as the `ECMAScript` target version. This basically amounts to stripping away types as well as transforming Typescript specific run-time functionality such as `enum`s and decorators.
2. Babel will perform the remaining transpilation with respect to your browserslist through `babel-preset-env`, some baked-in plugins representing features that are in stage 3 in TC39, as well as any presets and/or plugins you provide.
   In order to do so, all you have to do is simply provide a `browserslist` in the options provided to the plugin. For example:

```javascript
import tsPlugin from "@wessberg/rollup-plugin-ts";
export default {
  // ...
  plugins: [
    tsPlugin({
      // ...
      browserslist: ["last 2 versions"]
    })
  ]
};
```

## Contributing

Do you want to contribute? Awesome! Please follow [these recommendations](./CONTRIBUTING.md).

## Maintainers

- <a href="https://github.com/wessberg"><img alt="Frederik Wessberg" src="https://avatars2.githubusercontent.com/u/20454213?s=460&v=4" height="11"></img></a> [Frederik Wessberg](https://github.com/wessberg): _Maintainer_

## FAQ

### How are Typescript config options merged with the Rollup options?

The plugin attempts to make it as seamless as intuitive as possible. Whenever conflicts arise (which is almost exclusively related to output options), Rollup has the last word.
For example, Rollup decides which output formats to compile for, and which folders to place the generated assets in, rather than Typescript, since this is configured in the Rollup
output options.

### Does this plugin work with Code Splitting?

Yes! And I would encourage you to use it.

### Rollup complains about an import for something that isn't exported by a module

You may want to set the plugin option `parseExternalModules` to `true`.
By default, this option is false, and as a consequence, no external modules (e.g. those coming from `node_modules`) will be parsed by Typescript which may result in the unwanted preservation of exported types from other libraries in the compiled output.
For example, if you are depending on a type from a library like this:

```typescript
// Inside a library: 'my-library'
export type Foo = {
  /* Something */
};
```

And you then re-export it:

```typescript
// Inside your app or library
export {Foo} from "my-library";
```

Then it won't be stripped away by Typescript from the compiled Javascript Output if this option is `false`,
This option is `false` by default since it may lead to significant improvements to compilation time, but please toggle this option 'on' if you run into issues like this.

## Backers 🏅

[Become a backer](https://www.patreon.com/bePatron?u=11315442) and get your name, logo, and link to your site listed here.

## License 📄

MIT © [Frederik Wessberg](https://github.com/wessberg)
