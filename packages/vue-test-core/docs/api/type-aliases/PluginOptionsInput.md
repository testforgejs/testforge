[**@testforgejs/vue-test-core**](../README.md)

***

> **PluginOptionsInput** = \{ \[K in keyof PluginOptionsMap\]?: (K extends keyof PluginInstanceMap ? ResolvablePluginOptions\<PluginOptionsMap\[K\]\> & ExposeOption\<PluginInstanceMap\[K\]\> \| ResolvablePluginOptions\<Partial\<PluginOptionsMap\[K\]\>\> & PluginInstanceOptions\<PluginInstanceMap\[K\]\> : PluginOptionsWithoutInstance\<PluginOptionsMap\[K\]\>) \| false \}

Defined in: [packages/vue-test-core/src/types.ts:538](https://github.com/testforgejs/testforge/blob/445a1dda5af6e9fa30f2b4c58bbec4097a4a4e7a/packages/vue-test-core/src/types.ts#L538)

Configuration for plugins registered in `PluginOptionsMap`.

Supports native plugin options and deferred instance references
in configuration values.

Plugins registered in `PluginInstanceMap` also support instance
capture and reuse. Native creation options are required when creating
a new instance but may be omitted when an existing instance is supplied.

Install-based plugins do not support instance capture or reuse.
Setting a plugin to `false` disables it.

## Example

```typescript
import type { PluginOptionsInput } from "@testforgejs/vue-test-core";
import type {} from "@testforgejs/vue-test-plugin-router";
import { createMemoryHistory } from "vue-router";

const plugins: PluginOptionsInput = {
  router: {
    history: createMemoryHistory(),
    routes: [],
  },
};
```
