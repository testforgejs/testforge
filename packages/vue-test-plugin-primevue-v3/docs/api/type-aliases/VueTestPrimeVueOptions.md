[**@testforgejs/vue-test-plugin-primevue-v3**](../README.md)

***

> **VueTestPrimeVueOptions** = `PrimeVueConfiguration`

Defined in: [types/types.ts:38](https://github.com/testforgejs/testforge/blob/3d728172a303d7e9d78fc42ed41f076e9b5d2096/packages/vue-test-plugin-primevue-v3/src/types/types.ts#L38)

Configuration options for the managed PrimeVue 3 plugin.

Maps directly to the standard PrimeVue 3 configuration.

Unlike plugins that create a dedicated runtime instance, PrimeVue 3 uses
an install-based Vue plugin integration and therefore does not support
TestForge instance controls such as `captureInstance()`.

## Example

Configure the managed PrimeVue 3 plugin for a component test:

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
