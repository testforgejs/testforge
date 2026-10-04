[**@testforgejs/vue-test-plugin-vuetify**](../README.md)

***

> **VueTestVuetifyOptions** = `VuetifyOptions` & `PluginControlOptions`\<[`VuetifyInstance`](VuetifyInstance.md)\>

Defined in: [types/types.ts:38](https://github.com/testforgejs/testforge/blob/59da003c0d553647780ed2283c2e264267736f6c/packages/vue-test-plugin-vuetify/src/types/types.ts#L38)

Configuration options for the Vuetify test plugin.

Combines standard Vuetify configuration (`VuetifyOptions` from `vuetify`)
with TestForge plugin control options.

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

 - `VuetifyOptions` from `vuetify` for theme, icon, component, and directive configuration.
 - `PluginControlOptions` from `@testforgejs/vue-test-core` for instance capturing and exposure mechanisms.
