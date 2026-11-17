[**@testforgejs/vue-test-core**](../README.md)

***

> **PluginOverridesInput** = \{ \[K in keyof PluginOptionsMap\]?: (K extends keyof PluginInstanceMap ? PluginOverride\<PluginOptionsMap\[K\], PluginInstanceMap\[K\]\> : PluginOverrideWithoutInstance\<PluginOptionsMap\[K\]\>) \| false \}

Defined in: [packages/vue-test-core/src/types.ts:608](https://github.com/testforgejs/testforge/blob/445a1dda5af6e9fa30f2b4c58bbec4097a4a4e7a/packages/vue-test-core/src/types.ts#L608)

Per-mount plugin configuration overrides for registered plugins.

Used in `extraOptions.plugins` to override individual plugin options
without requiring complete native creation configuration.

Supports deferred instance references in override values.
Instance capture and reuse are available only for plugins registered
in `PluginInstanceMap`.

Setting a plugin to `false` disables it for the current mount.

## Example

```typescript
import type { PluginOverridesInput } from "@testforgejs/vue-test-core";
import type {} from "@testforgejs/vue-test-plugin-router";

const overrides: PluginOverridesInput = {
  router: {
    routes: [],
  },
};
```
