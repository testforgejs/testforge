[**@testforgejs/vue-test-core**](../README.md)

***

Defined in: [packages/vue-test-core/src/types.ts:1111](https://github.com/testforgejs/testforge/blob/445a1dda5af6e9fa30f2b4c58bbec4097a4a4e7a/packages/vue-test-core/src/types.ts#L1111)

Reusable factory for mounting a Vue component through TestForge.

Resolves factory-level defaults for each mount and supports both
positional and object-based mounting APIs.

Both invocation forms use equivalent configuration and mounting
behavior and return the same Vue Test Utils wrapper type.

## Type Parameters

### T

`T` *extends* `Component`

The Vue component type used to infer props, slots,
and mounting options.

> **ComponentFactory**(`props?`, `mountOptions?`, `slots?`, `extraOptions?`): `VueWrapper`\<`ComponentProps`\<`T` *extends* ((...`args`) => `any`) \| ((...`args`) => `any`) ? `T` : `T` *extends* `object` ? `DefineComponent`\<`Props` *extends* `PropNames`[] \| readonly `PropNames`[] ? `{ [key in string]?: any }` : `Props`\> : `DefineComponent`\> & `ComponentData`\<`T` *extends* ((...`args`) => `any`) \| ((...`args`) => `any`) ? `T` : `T` *extends* `object` ? `DefineComponent`\<`Props` *extends* `PropNames`[] \| readonly `PropNames`[] ? `{ [key in string]?: any }` : `Props`\> : `DefineComponent`\> & `ComponentExposed`\<`T` *extends* ((...`args`) => `any`) \| ((...`args`) => `any`) ? `T` : `T` *extends* `object` ? `DefineComponent`\<`Props` *extends* `PropNames`[] \| readonly `PropNames`[] ? `{ [key in string]?: any }` : `Props`\> : `DefineComponent`\>\>

Defined in: [packages/vue-test-core/src/types.ts:1135](https://github.com/testforgejs/testforge/blob/445a1dda5af6e9fa30f2b4c58bbec4097a4a4e7a/packages/vue-test-core/src/types.ts#L1135)

Mounts the component using positional arguments.

Combines the supplied configuration with factory-level defaults
and applies per-mount controls through `extraOptions`.

## Parameters

### props?

`Partial`\<`ComponentProps`\<`T`\>\>

Component props supplied for this mount.

### mountOptions?

[`ComponentFactoryOptions`](ComponentFactoryOptions.md)\<`Partial`\<`ComponentProps`\<`T`\>\>, `Partial`\<\{ \[K in string \| number \| symbol\]: RelaxedSlot\<ComponentSlots\<T\>\[K\]\> \}\>, `Partial`\<`ComponentData`\<`T`\>\>\>

Vue Test Utils mounting options, including
TestForge managed plugin configuration.

### slots?

`Partial`\<\{ \[K in string \| number \| symbol\]: RelaxedSlot\<ComponentSlots\<T\>\[K\]\> \}\>

Component slots supplied for this mount.

### extraOptions?

[`ComponentFactoryExtraOptions`](../type-aliases/ComponentFactoryExtraOptions.md)

Per-mount preset selection, default-skipping
controls, and plugin overrides.

## Returns

`VueWrapper`\<`ComponentProps`\<`T` *extends* ((...`args`) => `any`) \| ((...`args`) => `any`) ? `T` : `T` *extends* `object` ? `DefineComponent`\<`Props` *extends* `PropNames`[] \| readonly `PropNames`[] ? `{ [key in string]?: any }` : `Props`\> : `DefineComponent`\> & `ComponentData`\<`T` *extends* ((...`args`) => `any`) \| ((...`args`) => `any`) ? `T` : `T` *extends* `object` ? `DefineComponent`\<`Props` *extends* `PropNames`[] \| readonly `PropNames`[] ? `{ [key in string]?: any }` : `Props`\> : `DefineComponent`\> & `ComponentExposed`\<`T` *extends* ((...`args`) => `any`) \| ((...`args`) => `any`) ? `T` : `T` *extends* `object` ? `DefineComponent`\<`Props` *extends* `PropNames`[] \| readonly `PropNames`[] ? `{ [key in string]?: any }` : `Props`\> : `DefineComponent`\>\>

A Vue Test Utils wrapper for the mounted component.

## Example

```typescript
const wrapper = factory(
  { title: "Hello" },
  { shallow: false },
);
```

## Methods

### withOptions()

> **withOptions**(`options`): `VueWrapper`\<`ComponentProps`\<`T` *extends* ((...`args`) => `any`) \| ((...`args`) => `any`) ? `T` : `T` *extends* `object` ? `DefineComponent`\<`Props` *extends* `PropNames`[] \| readonly `PropNames`[] ? `{ [key in string]?: any }` : `Props`\> : `DefineComponent`\> & `ComponentData`\<`T` *extends* ((...`args`) => `any`) \| ((...`args`) => `any`) ? `T` : `T` *extends* `object` ? `DefineComponent`\<`Props` *extends* `PropNames`[] \| readonly `PropNames`[] ? `{ [key in string]?: any }` : `Props`\> : `DefineComponent`\> & `ComponentExposed`\<`T` *extends* ((...`args`) => `any`) \| ((...`args`) => `any`) ? `T` : `T` *extends* `object` ? `DefineComponent`\<`Props` *extends* `PropNames`[] \| readonly `PropNames`[] ? `{ [key in string]?: any }` : `Props`\> : `DefineComponent`\>\>

Defined in: [packages/vue-test-core/src/types.ts:1164](https://github.com/testforgejs/testforge/blob/445a1dda5af6e9fa30f2b4c58bbec4097a4a4e7a/packages/vue-test-core/src/types.ts#L1164)

Mounts the component using named arguments.

An alternative to calling `factory(props, mountOptions, slots, extraOptions)`.
Both forms use the same configuration resolution and mounting behavior.

#### Parameters

##### options

[`ComponentFactoryInvocationOptions`](ComponentFactoryInvocationOptions.md)\<`T`\>

Named arguments for this mount.

#### Returns

`VueWrapper`\<`ComponentProps`\<`T` *extends* ((...`args`) => `any`) \| ((...`args`) => `any`) ? `T` : `T` *extends* `object` ? `DefineComponent`\<`Props` *extends* `PropNames`[] \| readonly `PropNames`[] ? `{ [key in string]?: any }` : `Props`\> : `DefineComponent`\> & `ComponentData`\<`T` *extends* ((...`args`) => `any`) \| ((...`args`) => `any`) ? `T` : `T` *extends* `object` ? `DefineComponent`\<`Props` *extends* `PropNames`[] \| readonly `PropNames`[] ? `{ [key in string]?: any }` : `Props`\> : `DefineComponent`\> & `ComponentExposed`\<`T` *extends* ((...`args`) => `any`) \| ((...`args`) => `any`) ? `T` : `T` *extends* `object` ? `DefineComponent`\<`Props` *extends* `PropNames`[] \| readonly `PropNames`[] ? `{ [key in string]?: any }` : `Props`\> : `DefineComponent`\>\>

A Vue Test Utils wrapper for the mounted component.

#### Example

```typescript
const wrapper = factory.withOptions({
  props: { title: "Hello" },
  mountOptions: { shallow: false },
});
```
