[**@testforgejs/vue-test-core**](../README.md)

***

Defined in: [packages/vue-test-core/src/types.ts:950](https://github.com/testforgejs/testforge/blob/445a1dda5af6e9fa30f2b4c58bbec4097a4a4e7a/packages/vue-test-core/src/types.ts#L950)

Vue Test Utils mounting options extended with TestForge-specific controls.

Preserves standard Vue Test Utils options while providing component-aware
types for props, slots, and data, along with managed plugin configuration.

Used for both factory-level `defaultMountOptions` and per-mount
`mountOptions`.

## Extends

- `Omit`\<`MountingOptions`\<`Props`, `Data`\>, `"props"` \| `"slots"` \| `"data"`\>

## Type Parameters

### Props

`Props` = `any`

The component props type used to validate `props`.

### Slots

`Slots` = `any`

The component slots type used to validate `slots`.

### Data

`Data` = `any`

The component data type used to validate `data`.

## Properties

### attachTo?

> `optional` **attachTo?**: `string` \| `Element`

Defined in: node\_modules/.pnpm/@vue+test-utils@2.5.1\_@vue+compiler-dom@3.5.45\_@vue+server-renderer@3.5.45\_vue@3.5.45\_typescript@6.0.3\_/node\_modules/@vue/test-utils/dist/src/types.d.ts:68

Specify where to mount the component.
Can be a valid CSS selector, or an Element connected to the document.

#### See

https://test-utils.vuejs.org/api/#attachTo

#### Inherited from

`Omit.attachTo`

***

### attrs?

> `optional` **attrs?**: `Record`\<`string`, `unknown`\>

Defined in: node\_modules/.pnpm/@vue+test-utils@2.5.1\_@vue+compiler-dom@3.5.45\_@vue+server-renderer@3.5.45\_vue@3.5.45\_typescript@6.0.3\_/node\_modules/@vue/test-utils/dist/src/types.d.ts:40

Sets component attributes when mounted.

#### See

https://test-utils.vuejs.org/api/#attrs

#### Inherited from

`Omit.attrs`

***

### data?

> `optional` **data?**: () => `Data`

Defined in: [packages/vue-test-core/src/types.ts:957](https://github.com/testforgejs/testforge/blob/445a1dda5af6e9fa30f2b4c58bbec4097a4a4e7a/packages/vue-test-core/src/types.ts#L957)

Vue Test Utils data override factory, typed by `Data`.

#### Returns

`Data`

***

### global?

> `optional` **global?**: `GlobalMountOptions`

Defined in: node\_modules/.pnpm/@vue+test-utils@2.5.1\_@vue+compiler-dom@3.5.45\_@vue+server-renderer@3.5.45\_vue@3.5.45\_typescript@6.0.3\_/node\_modules/@vue/test-utils/dist/src/types.d.ts:51

Provides global mounting options to the component.

#### Inherited from

`Omit.global`

***

### plugins?

> `optional` **plugins?**: [`PluginOptionsInput`](../type-aliases/PluginOptionsInput.md)

Defined in: [packages/vue-test-core/src/types.ts:979](https://github.com/testforgejs/testforge/blob/445a1dda5af6e9fa30f2b4c58bbec4097a4a4e7a/packages/vue-test-core/src/types.ts#L979)

Configuration for TestForge-managed plugins declared in the active preset.

When supplied through per-mount `mountOptions`, a plugin's configuration
replaces its factory-level `defaultMountOptions.plugins` configuration.
Use `extraOptions.plugins` for partial per-mount overrides instead.

Set a plugin entry to `false` to disable that plugin.
Ordinary Vue plugins belong in Vue Test Utils `global.plugins`.

***

### props?

> `optional` **props?**: `Props`

Defined in: [packages/vue-test-core/src/types.ts:962](https://github.com/testforgejs/testforge/blob/445a1dda5af6e9fa30f2b4c58bbec4097a4a4e7a/packages/vue-test-core/src/types.ts#L962)

Component props supplied through mounting options, typed by `Props`.

***

### ~~propsData?~~

> `optional` **propsData?**: `Props`

Defined in: node\_modules/.pnpm/@vue+test-utils@2.5.1\_@vue+compiler-dom@3.5.45\_@vue+server-renderer@3.5.45\_vue@3.5.45\_typescript@6.0.3\_/node\_modules/@vue/test-utils/dist/src/types.d.ts:35

#### Deprecated

use `props` instead.

#### Inherited from

`Omit.propsData`

***

### shallow?

> `optional` **shallow?**: `boolean`

Defined in: node\_modules/.pnpm/@vue+test-utils@2.5.1\_@vue+compiler-dom@3.5.45\_@vue+server-renderer@3.5.45\_vue@3.5.45\_typescript@6.0.3\_/node\_modules/@vue/test-utils/dist/src/types.d.ts:57

Automatically stub out all the child components.

#### Default

```ts
false
```

#### See

https://test-utils.vuejs.org/api/#slots

#### Inherited from

`Omit.shallow`

***

### skipManagedPlugins?

> `optional` **skipManagedPlugins?**: `boolean`

Defined in: [packages/vue-test-core/src/types.ts:989](https://github.com/testforgejs/testforge/blob/445a1dda5af6e9fa30f2b4c58bbec4097a4a4e7a/packages/vue-test-core/src/types.ts#L989)

Whether to skip TestForge-managed plugin setup for this mount.

Does not disable ordinary Vue plugins registered through
Vue Test Utils `global.plugins`.

Defaults to `false`.

***

### slots?

> `optional` **slots?**: `Slots`

Defined in: [packages/vue-test-core/src/types.ts:967](https://github.com/testforgejs/testforge/blob/445a1dda5af6e9fa30f2b4c58bbec4097a4a4e7a/packages/vue-test-core/src/types.ts#L967)

Component slots supplied through mounting options, typed by `Slots`.
