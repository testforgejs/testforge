**@testforgejs/vue-test-plugin-pinia**

***

Pinia testing integration for TestForge.

Provides a managed Pinia plugin module, typed testing configuration,
store setup helpers, and the standardized TestForge plugin package contract.

Standardized package exports:
- `plugin` — alias of [piniaPlugin](variables/piniaPlugin.md).
- `PLUGIN_NAME` — stable identifier for the managed Pinia plugin.
- `PluginOptions` — type-only alias of [VueTestPiniaOptions](type-aliases/VueTestPiniaOptions.md).

The descriptive `piniaPlugin` and `VueTestPiniaOptions` exports
remain available for direct use.

## Type Aliases

- [MockStoresFn](type-aliases/MockStoresFn.md)
- [VueTestPiniaOptions](type-aliases/VueTestPiniaOptions.md)

## Variables

- [piniaPlugin](variables/piniaPlugin.md)
- [PLUGIN\_NAME](variables/PLUGIN_NAME.md)

## Functions

- [withMockStores](functions/withMockStores.md)

## References

### plugin

Renames and re-exports [piniaPlugin](variables/piniaPlugin.md)

***

### PluginOptions

Renames and re-exports [VueTestPiniaOptions](type-aliases/VueTestPiniaOptions.md)
