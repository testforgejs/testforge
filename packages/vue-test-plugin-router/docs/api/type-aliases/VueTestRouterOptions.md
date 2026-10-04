[**@testforgejs/vue-test-plugin-router**](../README.md)

***

> **VueTestRouterOptions** = `RouterOptions` & `PluginControlOptions`\<`Router`\>

Defined in: [types/types.ts:27](https://github.com/testforgejs/testforge/blob/6d5145f0835b1e50a32714930b42fa9c71c487ff/packages/vue-test-plugin-router/src/types/types.ts#L27)

Configuration options for the Vue Router test plugin.

Combines standard Vue Router configuration (`RouterOptions` from `vue-router`)
with TestForge plugin control options.

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

 - `RouterOptions` from `vue-router` for configuring routes and history.
 - `PluginControlOptions` from `@testforgejs/vue-test-core` for instance capturing and exposure mechanisms.
