[**@testforgejs/vue-test-plugin-primevue**](../README.md)

***

> **VueTestPrimeVueOptions** = `PrimeVueConfiguration`

Defined in: [types/types.ts:42](https://github.com/testforgejs/testforge/blob/e7a79bfa09a370e19f625ad91df804394db829ef/packages/vue-test-plugin-primevue/src/types/types.ts#L42)

Configuration options for the PrimeVue test plugin.

Maps directly to the native PrimeVue configuration.

PrimeVue uses an install-based Vue plugin integration rather than
a managed runtime instance. Therefore, TestForge instance management
mechanisms are not supported:

- `captureInstance()`
- `withPluginInstance()`
- `fromPluginInstance()`

## Example

Configure PrimeVue for a component test:

```ts
factory({}, {
  plugins: {
    primevue: {
      ripple: true,
    },
  },
});
```

## See

`PrimeVueConfiguration` from `primevue/config`.
