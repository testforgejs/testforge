[**@testforgejs/vue-test-plugin-vuetify**](../README.md)

***

> **VueTestVuetifyOptions** = `VuetifyOptions`

Defined in: [types/types.ts:40](https://github.com/testforgejs/testforge/blob/9b75ed967caaf78daacf038ab3c12d78ebb8d51c/packages/vue-test-plugin-vuetify/src/types/types.ts#L40)

Configuration options for the Vuetify test plugin.

Uses native Vuetify options for configuring the Vuetify instance
created by TestForge.

Managed instance controls are provided separately by TestForge
through its plugin configuration types.

## Example

Configure the managed Vuetify plugin for a component test:

```ts
factory({}, {
  plugins: {
    vuetify: {
      theme: {
        defaultTheme: "light",
      },
    },
  },
});
```

## See

`VuetifyOptions` from `vuetify` for native Vuetify configuration.
