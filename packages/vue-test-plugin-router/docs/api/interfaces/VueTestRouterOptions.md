[**@testforge/vue-test-plugin-router**](../README.md)

***

Defined in: packages/vue-test-plugin-router/src/types/types.ts:13

Configuration options for the Vue Router test plugin.

This interface integrates standard router initialization settings
and TestForge test kernel control options (such as `expose`).

## See

 - RouterOptions from the `vue-router` package for configuring routes and history.
 - PluginControlOptions from the `@testforge/vue-test-core` package for instance interception.

## Extends

- `RouterOptions`.`PluginControlOptions`\<`Router`\>

## Properties

### ~~end?~~

> `optional` **end?**: `boolean`

Defined in: node\_modules/.pnpm/vue-router@5.0.4\_@vue+compiler-sfc@3.5.32\_pinia@3.0.4\_typescript@6.0.3\_vue@3.5.32\_types\_4b35b78af17ef05763c29932b30c1bd3/node\_modules/vue-router/dist/index-BzEKChPW.d.ts:232

Should the RegExp match until the end by appending a `$` to it.

#### Deprecated

this option will alsways be `true` in the future. Open a discussion in vuejs/router if you need this to be `false`

#### Default Value

`true`

#### Inherited from

`RouterOptions.end`

***

### expose?

> `optional` **expose?**: (`instance`) => `void`

Defined in: packages/vue-test-core/src/types.ts:130

#### Parameters

##### instance

`Router`

#### Returns

`void`

#### Inherited from

`PluginControlOptions.expose`

***

### history

> **history**: `RouterHistory`

Defined in: node\_modules/.pnpm/vue-router@5.0.4\_@vue+compiler-sfc@3.5.32\_pinia@3.0.4\_typescript@6.0.3\_vue@3.5.32\_types\_4b35b78af17ef05763c29932b30c1bd3/node\_modules/vue-router/dist/index-BzEKChPW.d.ts:1731

History implementation used by the router. Most web applications should use
`createWebHistory` but it requires the server to be properly configured.
You can also use a _hash_ based history with `createWebHashHistory` that
does not require any configuration on the server but isn't handled at all
by search engines and does poorly on SEO.

#### Example

```js
createRouter({
  history: createWebHistory(),
  // other options...
})
```

#### Inherited from

`RouterOptions.history`

***

### linkActiveClass?

> `optional` **linkActiveClass?**: `string`

Defined in: node\_modules/.pnpm/vue-router@5.0.4\_@vue+compiler-sfc@3.5.32\_pinia@3.0.4\_typescript@6.0.3\_vue@3.5.32\_types\_4b35b78af17ef05763c29932b30c1bd3/node\_modules/vue-router/dist/index-BzEKChPW.d.ts:1774

Default class applied to active RouterLink. If none is provided,
`router-link-active` will be applied.

#### Inherited from

`RouterOptions.linkActiveClass`

***

### linkExactActiveClass?

> `optional` **linkExactActiveClass?**: `string`

Defined in: node\_modules/.pnpm/vue-router@5.0.4\_@vue+compiler-sfc@3.5.32\_pinia@3.0.4\_typescript@6.0.3\_vue@3.5.32\_types\_4b35b78af17ef05763c29932b30c1bd3/node\_modules/vue-router/dist/index-BzEKChPW.d.ts:1779

Default class applied to exact active RouterLink. If none is provided,
`router-link-exact-active` will be applied.

#### Inherited from

`RouterOptions.linkExactActiveClass`

***

### parseQuery?

> `optional` **parseQuery?**: `object`

Defined in: node\_modules/.pnpm/vue-router@5.0.4\_@vue+compiler-sfc@3.5.32\_pinia@3.0.4\_typescript@6.0.3\_vue@3.5.32\_types\_4b35b78af17ef05763c29932b30c1bd3/node\_modules/vue-router/dist/index-BzEKChPW.d.ts:1764

Custom implementation to parse a query. See its counterpart,
EXPERIMENTAL\_RouterOptions\_Base.stringifyQuery.

#### Example

Let's say you want to use the [qs package](https://github.com/ljharb/qs)
to parse queries, you can provide both `parseQuery` and `stringifyQuery`:
```js
import qs from 'qs'

createRouter({
  // other options...
  parseQuery: qs.parse,
  stringifyQuery: qs.stringify,
})
```

#### Inherited from

`RouterOptions.parseQuery`

***

### routes

> **routes**: readonly `RouteRecordRaw`[]

Defined in: node\_modules/.pnpm/vue-router@5.0.4\_@vue+compiler-sfc@3.5.32\_pinia@3.0.4\_typescript@6.0.3\_vue@3.5.32\_types\_4b35b78af17ef05763c29932b30c1bd3/node\_modules/vue-router/dist/index-BzEKChPW.d.ts:2045

Initial list of routes that should be added to the router.

#### Inherited from

`RouterOptions.routes`

***

### scrollBehavior?

> `optional` **scrollBehavior?**: `RouterScrollBehavior`

Defined in: node\_modules/.pnpm/vue-router@5.0.4\_@vue+compiler-sfc@3.5.32\_pinia@3.0.4\_typescript@6.0.3\_vue@3.5.32\_types\_4b35b78af17ef05763c29932b30c1bd3/node\_modules/vue-router/dist/index-BzEKChPW.d.ts:1746

Function to control scrolling when navigating between pages. Can return a
Promise to delay scrolling.

#### See

RouterScrollBehavior.

#### Example

```js
function scrollBehavior(to, from, savedPosition) {
  // `to` and `from` are both route locations
  // `savedPosition` can be null if there isn't one
}
```

#### Inherited from

`RouterOptions.scrollBehavior`

***

### sensitive?

> `optional` **sensitive?**: `boolean`

Defined in: node\_modules/.pnpm/vue-router@5.0.4\_@vue+compiler-sfc@3.5.32\_pinia@3.0.4\_typescript@6.0.3\_vue@3.5.32\_types\_4b35b78af17ef05763c29932b30c1bd3/node\_modules/vue-router/dist/index-BzEKChPW.d.ts:211

Makes the RegExp case-sensitive.

#### Default Value

`false`

#### Inherited from

`RouterOptions.sensitive`

***

### strict?

> `optional` **strict?**: `boolean`

Defined in: node\_modules/.pnpm/vue-router@5.0.4\_@vue+compiler-sfc@3.5.32\_pinia@3.0.4\_typescript@6.0.3\_vue@3.5.32\_types\_4b35b78af17ef05763c29932b30c1bd3/node\_modules/vue-router/dist/index-BzEKChPW.d.ts:217

Whether to disallow a trailing slash or not.

#### Default Value

`false`

#### Inherited from

`RouterOptions.strict`

***

### stringifyQuery?

> `optional` **stringifyQuery?**: `object`

Defined in: node\_modules/.pnpm/vue-router@5.0.4\_@vue+compiler-sfc@3.5.32\_pinia@3.0.4\_typescript@6.0.3\_vue@3.5.32\_types\_4b35b78af17ef05763c29932b30c1bd3/node\_modules/vue-router/dist/index-BzEKChPW.d.ts:1769

Custom implementation to stringify a query object. Should not prepend a leading `?`.
[parseQuery](#parsequery) counterpart to handle query parsing.

#### Inherited from

`RouterOptions.stringifyQuery`
