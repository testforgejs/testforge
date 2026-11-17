[**@testforgejs/vue-test-core**](../README.md)

***

> **captureInstance**\<`T`\>(): `InstanceCapture`\<`T`\>

Defined in: [packages/vue-test-core/src/plugins/instances/captureInstance.ts:29](https://github.com/testforgejs/testforge/blob/445a1dda5af6e9fa30f2b4c58bbec4097a4a4e7a/packages/vue-test-core/src/plugins/instances/captureInstance.ts#L29)

Creates a handle for capturing a managed plugin instance.

Exposes an internal symbol-keyed callback that can be spread into
plugin configuration without conflicting with native plugin options.

The captured instance is available through the `instance` getter
after the plugin has been created or reused. Until then, the getter
returns `undefined`.

The `instance` getter is non-enumerable and is not included when
the capture handle is spread into plugin configuration.

Each capture handle should be used for a single component mount.
Reusing it across mounts overwrites the previously captured instance.

Specify `T` explicitly for type-safe access to the captured instance.
Without an explicit type argument, the instance is typed as `unknown`.

## Type Parameters

### T

`T` = `unknown`

The expected type of the managed plugin instance.

## Returns

`InstanceCapture`\<`T`\>

A capture handle containing the instance getter and
an internal symbol-keyed capture callback.
