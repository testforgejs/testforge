[**@testforgejs/vue-test-core**](../README.md)

***

> **createTestFramework**(`options?`): [`TestFramework`](../interfaces/TestFramework.md)

Defined in: [packages/vue-test-core/src/core/createTestFramework.ts:47](https://github.com/testforgejs/testforge/blob/445a1dda5af6e9fa30f2b4c58bbec4097a4a4e7a/packages/vue-test-core/src/core/createTestFramework.ts#L47)

Creates a TestForge framework for reusable Vue component testing.

Configures the available presets and default mounting behavior, and
provides a component factory creator supporting both positional and
resolver-based creation APIs.

A framework can be configured with a single preset, a collection of
named presets, or no presets. The `preset` and `presets` options are
mutually exclusive.

## Parameters

### options?

[`CreateTestFrameworkOptions`](../type-aliases/CreateTestFrameworkOptions.md) = `{}`

Framework configuration. If omitted, creates a framework
without presets and with `shallowByDefault` set to `false`.

## Returns

[`TestFramework`](../interfaces/TestFramework.md)

A framework exposing the `testComponentFactory` API.

## Example

```typescript
import { createTestFramework } from "@testforgejs/vue-test-core";
import MyComponent from "./MyComponent.vue";

const { testComponentFactory } = createTestFramework();

const factory = testComponentFactory(MyComponent);
const wrapper = factory();
```
