[**@testforgejs/vue-test-plugin-router**](../README.md)

***

> **VueTestRouterOptions** = `RouterOptions` & `PluginControlOptions`\<`Router`\>

Defined in: [types/types.ts:30](https://github.com/testforgejs/testforge/blob/3d728172a303d7e9d78fc42ed41f076e9b5d2096/packages/vue-test-plugin-router/src/types/types.ts#L30)

Configuration options for the Vue Router test plugin.

Combines native Vue Router options with TestForge-specific
controls for managed plugin instances.

TestForge control options are handled internally and are not
forwarded to the native Vue Router factory.

## Example

Configure the managed Vue Router plugin for a component test:

```ts
factory({}, {
  plugins: {
    router: {
      history: createMemoryHistory(),
      routes: [],
    },
  },
});
```

## See

 - `RouterOptions` from `vue-router` for native Vue Router configuration.
 - `PluginControlOptions` from `@testforgejs/vue-test-core` for type-safe instance capturing.
