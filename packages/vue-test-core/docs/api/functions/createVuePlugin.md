[**@testforgejs/vue-test-core**](../README.md)

***

> **createVuePlugin**\<`TPlugin`, `TOptions`\>(`plugin`, `options`): \[`TPlugin`, `TOptions`\]

Defined in: [packages/vue-test-core/src/plugins/install/createVuePlugin.ts:33](https://github.com/testforgejs/testforge/blob/445a1dda5af6e9fa30f2b4c58bbec4097a4a4e7a/packages/vue-test-core/src/plugins/install/createVuePlugin.ts#L33)

Creates a Vue Test Utils-compatible tuple for an install-based Vue plugin.

Supports Vue plugins implemented as install objects or install functions.
Returns the plugin and its options without invoking the plugin's
installation function.

Unlike `createPluginInstance()`, this helper does not create or manage
runtime instances. Shared-instance reuse and instance capture are
not supported.

The original options object is returned unchanged.

## Type Parameters

### TPlugin

`TPlugin` *extends* `Plugin`

The installable Vue plugin type.

### TOptions

`TOptions` *extends* `object`

The options passed to the plugin during installation.

## Parameters

### plugin

`TPlugin`

The Vue plugin to install.

### options

[`RuntimePluginOptions`](../type-aliases/RuntimePluginOptions.md)\<\[`TPlugin`, `TOptions`\], `TOptions`\>

The plugin installation options.

## Returns

\[`TPlugin`, `TOptions`\]

A `[plugin, options]` tuple compatible with Vue Test Utils.

## Throws

If shared-instance reuse or instance capture is requested.
