[**@testforgejs/vue-test-core**](../README.md)

***

Defined in: [packages/vue-test-core/src/types.ts:1081](https://github.com/testforgejs/testforge/blob/445a1dda5af6e9fa30f2b4c58bbec4097a4a4e7a/packages/vue-test-core/src/types.ts#L1081)

Named arguments for mounting a component through `factory.withOptions()`.

Each property corresponds to a positional argument of `factory()`.
Both invocation forms use equivalent configuration resolution
and mounting behavior.

All properties are optional. Omitted properties behave as omitted
positional arguments, preserving applicable factory-level defaults.

## Example

```typescript
const wrapper = factory.withOptions({
  props: { title: "Hello" },
  mountOptions: { shallow: false },
});
```

## Type Parameters

### T

`T` *extends* `Component`

The Vue component type used to infer props, slots,
and component data.

## Properties

### extraOptions?

> `optional` **extraOptions?**: [`ComponentFactoryExtraOptions`](../type-aliases/ComponentFactoryExtraOptions.md)

Defined in: [packages/vue-test-core/src/types.ts:1096](https://github.com/testforgejs/testforge/blob/445a1dda5af6e9fa30f2b4c58bbec4097a4a4e7a/packages/vue-test-core/src/types.ts#L1096)

Per-mount preset selection, default-skipping controls, and plugin overrides.

***

### mountOptions?

> `optional` **mountOptions?**: [`ComponentFactoryOptions`](ComponentFactoryOptions.md)\<`Partial`\<`ComponentProps`\<`T`\>\>, `Partial`\<\{ \[K in string \| number \| symbol\]: RelaxedSlot\<ComponentSlots\<T\>\[K\]\> \}\>, `Partial`\<`ComponentData`\<`T`\>\>\>

Defined in: [packages/vue-test-core/src/types.ts:1086](https://github.com/testforgejs/testforge/blob/445a1dda5af6e9fa30f2b4c58bbec4097a4a4e7a/packages/vue-test-core/src/types.ts#L1086)

Vue Test Utils mounting options, including TestForge managed plugin configuration.

***

### props?

> `optional` **props?**: `Partial`\<`ComponentProps`\<`T`\>\>

Defined in: [packages/vue-test-core/src/types.ts:1083](https://github.com/testforgejs/testforge/blob/445a1dda5af6e9fa30f2b4c58bbec4097a4a4e7a/packages/vue-test-core/src/types.ts#L1083)

Component props supplied for this mount.

***

### slots?

> `optional` **slots?**: `Partial`\<\{ \[K in string \| number \| symbol\]: RelaxedSlot\<ComponentSlots\<T\>\[K\]\> \}\>

Defined in: [packages/vue-test-core/src/types.ts:1093](https://github.com/testforgejs/testforge/blob/445a1dda5af6e9fa30f2b4c58bbec4097a4a4e7a/packages/vue-test-core/src/types.ts#L1093)

Component slots supplied for this mount.
