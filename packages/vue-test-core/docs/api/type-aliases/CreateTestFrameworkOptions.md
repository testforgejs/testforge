[**@testforgejs/vue-test-core**](../README.md)

***

> **CreateTestFrameworkOptions** = `SinglePresetOptions` \| `MultiplePresetsOptions`

Defined in: [packages/vue-test-core/src/types.ts:1318](https://github.com/testforgejs/testforge/blob/445a1dda5af6e9fa30f2b4c58bbec4097a4a4e7a/packages/vue-test-core/src/types.ts#L1318)

Configuration options for `createTestFramework()`.

Supports a single preset through `preset` or a collection of named
presets through `presets`. These options are mutually exclusive.

Both options may be omitted to create a framework without presets.

`shallowByDefault` is available in both configurations and defaults
to `false`.

## Example

```typescript
import type { CreateTestFrameworkOptions } from "@testforgejs/vue-test-core";

// A single preset.
const single: CreateTestFrameworkOptions = {
  preset: basePreset,
};

// A collection of named presets.
const multiple: CreateTestFrameworkOptions = {
  presets: {
    default: basePreset,
    admin: adminPreset,
  },
};

// No presets.
const empty: CreateTestFrameworkOptions = {};
```
