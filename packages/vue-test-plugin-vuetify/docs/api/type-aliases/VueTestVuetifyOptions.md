[**@testforgejs/vue-test-plugin-vuetify**](../README.md)

***

> **VueTestVuetifyOptions** = `VuetifyOptions` & `PluginControlOptions`\<[`VuetifyInstance`](VuetifyInstance.md)\>

Defined in: [types/types.ts:41](https://github.com/testforgejs/testforge/blob/3d728172a303d7e9d78fc42ed41f076e9b5d2096/packages/vue-test-plugin-vuetify/src/types/types.ts#L41)

Configuration options for the Vuetify test plugin.

Combines native Vuetify options with TestForge-specific
controls for managed plugin instances.

TestForge control options are handled internally and are not
forwarded to the native Vuetify factory.

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

 - `VuetifyOptions` from `vuetify` for native Vuetify configuration.
 - `PluginControlOptions` from `@testforgejs/vue-test-core` for type-safe instance capturing.
