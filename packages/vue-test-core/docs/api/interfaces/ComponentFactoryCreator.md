[**@testforgejs/vue-test-core**](../README.md)

***

Defined in: [packages/vue-test-core/src/types.ts:1176](https://github.com/testforgejs/testforge/blob/445a1dda5af6e9fa30f2b4c58bbec4097a4a4e7a/packages/vue-test-core/src/types.ts#L1176)

Creates reusable component test factories.

Supports positional factory creation with individual default resolvers
and object-based creation through a single configuration resolver.

Both APIs produce a `ComponentFactory` and resolve fresh default
configuration for each mount.

> **ComponentFactoryCreator**\<`T`\>(`component`, `defaultProps?`, `defaultMountOptions?`, `defaultSlots?`, `config?`): [`ComponentFactory`](ComponentFactory.md)\<`T`\>

Defined in: [packages/vue-test-core/src/types.ts:1207](https://github.com/testforgejs/testforge/blob/445a1dda5af6e9fa30f2b4c58bbec4097a4a4e7a/packages/vue-test-core/src/types.ts#L1207)

Creates a component factory using positional arguments.

The component and factory-level configuration remain fixed, while
the supplied default resolvers are invoked once per mount.

Default resolvers should return fresh mutable data to prevent
state leakage between component mounts.

## Type Parameters

### T

`T` *extends* `Component`

The Vue component type, inferred from `component`.

## Parameters

### component

`T`

The Vue component to mount.

### defaultProps?

[`DefaultPropsResolver`](../type-aliases/DefaultPropsResolver.md)\<`NoInfer`\<`T`\>\>

Optional resolver for default component props.

### defaultMountOptions?

[`DefaultMountOptionsResolver`](../type-aliases/DefaultMountOptionsResolver.md)\<`NoInfer`\<`T`\>\>

Optional resolver for default mounting options.

### defaultSlots?

[`DefaultSlotsResolver`](../type-aliases/DefaultSlotsResolver.md)\<`NoInfer`\<`T`\>\>

Optional resolver for default component slots.

### config?

`ComponentFactoryConfig`

Optional factory-level configuration, including `presetKey`.

## Returns

[`ComponentFactory`](ComponentFactory.md)\<`T`\>

A reusable component test factory.

## Example

```typescript
const factory = testComponentFactory(
  MyComponent,
  () => ({ title: "Hello" }),
  () => ({ shallow: false }),
);

const wrapper = factory();
```

## Methods

### withOptions()

> **withOptions**\<`T`, `Resolved`\>(`resolveOptions`): [`ComponentFactory`](ComponentFactory.md)\<`T`\>

Defined in: [packages/vue-test-core/src/types.ts:1243](https://github.com/testforgejs/testforge/blob/445a1dda5af6e9fa30f2b4c58bbec4097a4a4e7a/packages/vue-test-core/src/types.ts#L1243)

Creates a component factory using a named configuration resolver.

The resolver is invoked once per mount and returns the component,
optional default configuration, and factory-level settings.

The resolver should return fresh mutable configuration data to
prevent state leakage between component mounts.

#### Type Parameters

##### T

`T` *extends* `Component`

The Vue component type, inferred from the resolver.

##### Resolved

`Resolved` *extends* [`ComponentFactoryCreationOptions`](ComponentFactoryCreationOptions.md)\<`T`\>

The inferred configuration shape, used to
validate TestForge-owned configuration keys.

#### Parameters

##### resolveOptions

[`FactoryOptionsResolver`](../type-aliases/FactoryOptionsResolver.md)\<`T`, `Resolved`\>

Resolver returning the component factory configuration.

#### Returns

[`ComponentFactory`](ComponentFactory.md)\<`T`\>

A reusable component test factory.

#### Example

```typescript
const factory = testComponentFactory.withOptions(() => ({
  component: MyComponent,
  defaultProps: { title: "Hello" },
  defaultMountOptions: { shallow: false },
}));

const wrapper = factory();
```
