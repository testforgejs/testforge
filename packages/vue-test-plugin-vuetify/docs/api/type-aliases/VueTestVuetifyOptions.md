[**@testforgejs/vue-test-plugin-vuetify**](../README.md)

***

> **VueTestVuetifyOptions** = `VuetifyOptions`

Defined in: [types/types.ts:40](https://github.com/testforgejs/testforge/blob/9fe06ed8809dd0c6a08450484b8c012e43032cd5/packages/vue-test-plugin-vuetify/src/types/types.ts#L40)

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
