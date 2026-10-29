[**@testforgejs/vue-test-plugin-router**](../README.md)

***

> **VueTestRouterOptions** = `RouterOptions`

Defined in: [types/types.ts:29](https://github.com/testforgejs/testforge/blob/e7a79bfa09a370e19f625ad91df804394db829ef/packages/vue-test-plugin-router/src/types/types.ts#L29)

Configuration options for the Vue Router test plugin.

Uses native Vue Router options for configuring the router instance
created by TestForge.

Managed instance controls are provided separately by TestForge
through its plugin configuration types.

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

`RouterOptions` from `vue-router` for native Vue Router configuration.
