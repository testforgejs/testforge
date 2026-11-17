[**@testforgejs/vue-test-core**](../README.md)

***

Defined in: [packages/vue-test-core/src/types.ts:107](https://github.com/testforgejs/testforge/blob/445a1dda5af6e9fa30f2b4c58bbec4097a4a4e7a/packages/vue-test-core/src/types.ts#L107)

Defines the creation lifecycle and runtime capabilities of a managed plugin.

The framework executes the plugin lifecycle in the following order:
`beforeCreate()` → `create()` → `afterCreate()`.

Only `create()` is required. The lifecycle hooks allow plugins to
transform resolved options and perform initialization after creation.

## Type Parameters

### TPlugin

`TPlugin` *extends* [`MountPlugin`](../type-aliases/MountPlugin.md) = [`MountPlugin`](../type-aliases/MountPlugin.md)

The Vue Test Utils-compatible plugin value
returned by the creation function.

### TOptions

`TOptions` = `unknown`

The options accepted by the plugin's creation
function and optional `beforeCreate()` hook.

## Properties

### afterCreate?

> `optional` **afterCreate?**: (`plugin`, `ctx`) => `void`

Defined in: [packages/vue-test-core/src/types.ts:130](https://github.com/testforgejs/testforge/blob/445a1dda5af6e9fa30f2b4c58bbec4097a4a4e7a/packages/vue-test-core/src/types.ts#L130)

Runs after the plugin value has been created.

Receives the created plugin value and the current pipeline context.
Can be used to activate or synchronize plugin-specific runtime state.

#### Parameters

##### plugin

`TPlugin`

##### ctx

`PipelineContext`

#### Returns

`void`

***

### beforeCreate?

> `optional` **beforeCreate?**: (`ctx`, `options`) => `TOptions`

Defined in: [packages/vue-test-core/src/types.ts:114](https://github.com/testforgejs/testforge/blob/445a1dda5af6e9fa30f2b4c58bbec4097a4a4e7a/packages/vue-test-core/src/types.ts#L114)

Transforms resolved plugin options before creation.

Receives the current pipeline context and must return the options
passed to `create()`.

#### Parameters

##### ctx

`PipelineContext`

##### options

`TOptions`

#### Returns

`TOptions`

***

### create

> **create**: (`options`) => `TPlugin`

Defined in: [packages/vue-test-core/src/types.ts:122](https://github.com/testforgejs/testforge/blob/445a1dda5af6e9fa30f2b4c58bbec4097a4a4e7a/packages/vue-test-core/src/types.ts#L122)

Creates the plugin value to be installed through Vue Test Utils.

Returns a plugin instance or an installable plugin tuple,
depending on the plugin integration.

#### Parameters

##### options

`TOptions`

#### Returns

`TPlugin`

***

### supportsInstanceReferences?

> `optional` **supportsInstanceReferences?**: `true`

Defined in: [packages/vue-test-core/src/types.ts:138](https://github.com/testforgejs/testforge/blob/445a1dda5af6e9fa30f2b4c58bbec4097a4a4e7a/packages/vue-test-core/src/types.ts#L138)

Declares runtime support for deferred managed plugin instance references.

Set to `true` only for plugins supporting `fromPluginInstance()`.
Requires corresponding type registration in `PluginInstanceMap`.
