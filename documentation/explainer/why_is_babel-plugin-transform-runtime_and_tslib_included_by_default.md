#### Why are helpers imported by default, and why are things like @babel/plugin-transform-runtime, tslib, and @swc/helpers peer dependencies?

Babel and Typescript both come with a set of helper functions.
For example, the following code:

```typescript
typeof foo;
```

May be transpiled into something like this with Babel:

```typescript
function _typeof(obj) {
	// ...
}

typeof foo === "undefined" ? "undefined" : _typeof(foo);
```

And something similar to it with TypeScript. Let's focus on Babel for now, but the same can be said for using TypeScript as the transpiler:

With `rollup-plugin-ts`, most Babel plugins are run per file, rather than per-chunk. This is because for each file, the output provided to Rollup must be compatible with [Acorn](https://github.com/acornjs/acorn), which Rollup is based on, and you may be transforming experimental syntax that Acorn doesn't yet support.
In effect, this means that if you pass 3 files containing `typeof` through Rollup, you get 3 duplications of the helper inside the output bundle. For example

```typescript
function _typeof(obj) {
	/* ... */
}
typeof foo === "undefined" ? "undefined" : _typeof(foo);
function _typeof$1(obj) {
	/* ... */
}
typeof bar === "undefined" ? "undefined" : _typeof$1(bar);
function _typeof$2(obj) {
	/* ... */
}
typeof baz === "undefined" ? "undefined" : _typeof$2(baz);
```

That's unfortunate. `@babel/plugin-transform-runtime` and `tslib` enables you to move reference these helpers via import statements such that they can be shared across files and code split correctly.
With the example from above, the same input would be transformed into something like:

```typescript
import _typeof from "@babel/runtime/helpers/esm/typeof.js";

typeof foo === "undefined" ? "undefined" : _typeof(foo);
```

As long as `@babel/runtime/helpers/esm/typeof.js` is resolvable inside of your `node_modules` directory and you haven't explicitly marked it as external,
here's how the output bundle may look:

```typescript
function _typeof(obj) {
	/* ... */
}
typeof foo === "undefined" ? "undefined" : _typeof(foo);
typeof bar === "undefined" ? "undefined" : _typeof(bar);
typeof baz === "undefined" ? "undefined" : _typeof(baz);
```

#### OK, but there are some imports from @babel/runtime left inside my bundle?

If your end bundle looks something like this (using ESM as the output target):

```typescript
import _typeof from "@babel/runtime/helpers/esm/typeof.js";
typeof foo === "undefined" ? "undefined" : _typeof(foo);
typeof bar === "undefined" ? "undefined" : _typeof(bar);
typeof baz === "undefined" ? "undefined" : _typeof(baz);
```

Then one of two things has happened:

A) You've explicitly marked `@babel/runtime/**` as `external` in your Rollup config, or
B) `@babel/runtime/helpers/esm/typeof.js` was not resolvable from your filesystem when trying to resolve it using the Node Module Resolution Algorithm.

- If _(A)_, then you can simply remove it from the `external` property inside your Rollup config.
- If _(B)_, multiple things may have happened:
  - You may simply not have installed all dependencies. Please verify the validity of your `node_modules` directory.
  - Or, you may depend on conflicting versions of `@babel/runtime` which may lead to this issue.
