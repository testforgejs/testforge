[**@testforgejs/vue-test-core**](../README.md)

***

Defined in: [packages/vue-test-core/src/types.ts:63](https://github.com/testforgejs/testforge/blob/445a1dda5af6e9fa30f2b4c58bbec4097a4a4e7a/packages/vue-test-core/src/types.ts#L63)

Test-runner operations available to plugin default-options factories.

Provides a common interface for mock and spy operations without
depending on Vitest- or Jest-specific types.

Mock and spy return types are intentionally runner-agnostic.

## Properties

### clearAllMocks

> **clearAllMocks**: () => `any`

Defined in: [packages/vue-test-core/src/types.ts:80](https://github.com/testforgejs/testforge/blob/445a1dda5af6e9fa30f2b4c58bbec4097a4a4e7a/packages/vue-test-core/src/types.ts#L80)

Clears recorded mock calls without resetting mock implementations.

#### Returns

`any`

***

### fn

> **fn**: \<`T`\>(`implementation?`) => `any`

Defined in: [packages/vue-test-core/src/types.ts:67](https://github.com/testforgejs/testforge/blob/445a1dda5af6e9fa30f2b4c58bbec4097a4a4e7a/packages/vue-test-core/src/types.ts#L67)

Creates a mock function, optionally using the provided implementation.

#### Type Parameters

##### T

`T` *extends* (...`args`) => `any`

#### Parameters

##### implementation?

`T`

#### Returns

`any`

***

### resetAllMocks

> **resetAllMocks**: () => `any`

Defined in: [packages/vue-test-core/src/types.ts:85](https://github.com/testforgejs/testforge/blob/445a1dda5af6e9fa30f2b4c58bbec4097a4a4e7a/packages/vue-test-core/src/types.ts#L85)

Resets mock call history and implementations.

#### Returns

`any`

***

### restoreAllMocks

> **restoreAllMocks**: () => `any`

Defined in: [packages/vue-test-core/src/types.ts:90](https://github.com/testforgejs/testforge/blob/445a1dda5af6e9fa30f2b4c58bbec4097a4a4e7a/packages/vue-test-core/src/types.ts#L90)

Restores original implementations of spied-on methods.

#### Returns

`any`

***

### spyOn

> **spyOn**: \<`T`, `M`\>(`object`, `method`) => `T`\[`M`\] *extends* (...`args`) => `any` ? `any` : `never`

Defined in: [packages/vue-test-core/src/types.ts:72](https://github.com/testforgejs/testforge/blob/445a1dda5af6e9fa30f2b4c58bbec4097a4a4e7a/packages/vue-test-core/src/types.ts#L72)

Creates a spy on a method of the given object.

#### Type Parameters

##### T

`T` *extends* `object`

##### M

`M` *extends* `string` \| `number` \| `symbol`

#### Parameters

##### object

`T`

##### method

`M`

#### Returns

`T`\[`M`\] *extends* (...`args`) => `any` ? `any` : `never`
