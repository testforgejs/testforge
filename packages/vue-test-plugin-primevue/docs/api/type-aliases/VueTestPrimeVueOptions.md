[**@testforgejs/vue-test-plugin-primevue**](../README.md)

***

> **VueTestPrimeVueOptions** = `PrimeVueConfiguration`

Defined in: [types/types.ts:41](https://github.com/testforgejs/testforge/blob/9fe06ed8809dd0c6a08450484b8c012e43032cd5/packages/vue-test-plugin-primevue/src/types/types.ts#L41)

Configuration options for the managed PrimeVue plugin.

Maps directly to the standard PrimeVue configuration.

Unlike plugins that create a dedicated runtime instance, PrimeVue uses
an install-based Vue plugin integration and therefore does not support
TestForge instance management mechanisms:
- captureInstance()
- withPluginInstance()
- fromPluginInstance()

## Example

Configure the managed PrimeVue plugin for a component test:

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
