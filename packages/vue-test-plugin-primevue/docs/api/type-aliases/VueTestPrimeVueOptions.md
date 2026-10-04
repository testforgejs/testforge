[**@testforgejs/vue-test-plugin-primevue**](../README.md)

***

> **VueTestPrimeVueOptions** = `PrimeVueConfiguration`

Defined in: [types/types.ts:38](https://github.com/testforgejs/testforge/blob/9cfd3a2e112de126cbfa15198961d9b37823b7d1/packages/vue-test-plugin-primevue/src/types/types.ts#L38)

Configuration options for the managed PrimeVue plugin.

Maps directly to the standard PrimeVue configuration.

Unlike plugins that create a dedicated runtime instance, PrimeVue uses
an install-based Vue plugin integration and therefore does not support
TestForge instance controls such as `expose`.

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
