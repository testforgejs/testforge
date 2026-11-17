[**@testforgejs/vue-test-core**](../README.md)

***

Defined in: [packages/vue-test-core/src/types.ts:1254](https://github.com/testforgejs/testforge/blob/445a1dda5af6e9fa30f2b4c58bbec4097a4a4e7a/packages/vue-test-core/src/types.ts#L1254)

A TestForge framework instance created by `createTestFramework()`.

Provides a component factory creator configured with the framework's
presets and default mounting behavior.

## Properties

### testComponentFactory

> **testComponentFactory**: [`ComponentFactoryCreator`](ComponentFactoryCreator.md)

Defined in: [packages/vue-test-core/src/types.ts:1259](https://github.com/testforgejs/testforge/blob/445a1dda5af6e9fa30f2b4c58bbec4097a4a4e7a/packages/vue-test-core/src/types.ts#L1259)

Creates reusable component factories using positional arguments
or a configuration resolver through `.withOptions()`.
