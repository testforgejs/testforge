[**@testforgejs/vue-test-plugin-primevue-v3**](../README.md)

***

> **VueTestPrimeVueOptions** = `PrimeVueConfiguration`

Defined in: [types/types.ts:42](https://github.com/testforgejs/testforge/blob/259fb32dae424d2d7036a4058dacaf98183a7f3d/packages/vue-test-plugin-primevue-v3/src/types/types.ts#L42)

Configuration options for the PrimeVue 3 test plugin.

Maps directly to the native PrimeVue 3 configuration.

PrimeVue 3 uses an install-based Vue plugin integration rather than
a managed runtime instance. Therefore, TestForge instance management
mechanisms are not supported:

- `captureInstance()`
- `withPluginInstance()`
- `fromPluginInstance()`

## Example

Configure PrimeVue 3 for a component test:

```ts
factory({}, {
  plugins: {
    primevueV3: {
      ripple: true,
    },
  },
});
```

## See

`PrimeVueConfiguration` from `primevue/config`.
