[**@testforgejs/vue-test-core**](../README.md)

***

Defined in: [packages/vue-test-core/src/types.ts:840](https://github.com/testforgejs/testforge/blob/445a1dda5af6e9fa30f2b4c58bbec4097a4a4e7a/packages/vue-test-core/src/types.ts#L840)

Named configuration returned by a component factory options resolver.

Defines the component, its default props, mounting options, slots,
and optional factory-level preset selection.

The configuration is resolved for each mount. Mutable default values
should be recreated by the resolver to prevent state leakage between
component mounts.

The component determines the types of default props, slots, and data.
`NoInfer` prevents default configuration values from influencing
component type inference.

## Extends

- `ComponentFactoryConfig`

## Type Parameters

### T

`T` *extends* `Component`

The Vue component type used to validate default
props, slots, and mounting options.

## Properties

### component

> **component**: `T`

Defined in: [packages/vue-test-core/src/types.ts:848](https://github.com/testforgejs/testforge/blob/445a1dda5af6e9fa30f2b4c58bbec4097a4a4e7a/packages/vue-test-core/src/types.ts#L848)

Vue component to mount.

Determines the component-specific types of the default configuration.

***

### defaultMountOptions?

> `optional` **defaultMountOptions?**: [`ComponentFactoryOptions`](ComponentFactoryOptions.md)\<`Partial`\<`ComponentProps`\<`NoInfer`\<`T`\>\>\>, `Partial`\<\{ \[K in string \| number \| symbol\]: RelaxedSlot\<ComponentSlots\<NoInfer\<T\>\>\[K\]\> \}\>, `Partial`\<`ComponentData`\<`NoInfer`\<`T`\>\>\>\>

Defined in: [packages/vue-test-core/src/types.ts:857](https://github.com/testforgejs/testforge/blob/445a1dda5af6e9fa30f2b4c58bbec4097a4a4e7a/packages/vue-test-core/src/types.ts#L857)

Default Vue Test Utils mounting options, including TestForge
managed plugin configuration.

***

### defaultProps?

> `optional` **defaultProps?**: `Partial`\<`ComponentProps`\<`NoInfer`\<`T`\>\>\>

Defined in: [packages/vue-test-core/src/types.ts:851](https://github.com/testforgejs/testforge/blob/445a1dda5af6e9fa30f2b4c58bbec4097a4a4e7a/packages/vue-test-core/src/types.ts#L851)

Default props applied to each mount.

***

### defaultSlots?

> `optional` **defaultSlots?**: `Partial`\<\{ \[K in string \| number \| symbol\]: RelaxedSlot\<ComponentSlots\<NoInfer\<T\>\>\[K\]\> \}\>

Defined in: [packages/vue-test-core/src/types.ts:864](https://github.com/testforgejs/testforge/blob/445a1dda5af6e9fa30f2b4c58bbec4097a4a4e7a/packages/vue-test-core/src/types.ts#L864)

Default component slots applied to each mount.

***

### presetKey?

> `optional` **presetKey?**: `string`

Defined in: [packages/vue-test-core/src/types.ts:820](https://github.com/testforgejs/testforge/blob/445a1dda5af6e9fa30f2b4c58bbec4097a4a4e7a/packages/vue-test-core/src/types.ts#L820)

Preset key used by default when mounting components through this factory.

A mount-level `presetKey` takes precedence over this value.
When omitted, the framework's normal preset resolution applies.

#### Inherited from

`ComponentFactoryConfig.presetKey`
