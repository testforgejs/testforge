[**@testforgejs/vue-test-plugin-i18n**](../README.md)

***

> **VueTestI18nOptions** = `I18nOptions` & `PluginControlOptions`\<`I18n`\>

Defined in: [types/types.ts:34](https://github.com/testforgejs/testforge/blob/3d728172a303d7e9d78fc42ed41f076e9b5d2096/packages/vue-test-plugin-i18n/src/types/types.ts#L34)

Configuration options for the Vue I18n test plugin.

Combines native Vue I18n options with TestForge-specific
controls for managed plugin instances.

TestForge control options are validated as part of the plugin
configuration and are not forwarded to the native Vue I18n factory.

## Example

Configure the managed Vue I18n plugin for a component test:

```ts
factory({}, {
  plugins: {
    i18n: {
      locale: "en",
      messages: {
        en: {
          hello: "Hello World",
        },
      },
    },
  },
});
```

## See

 - `I18nOptions` from `vue-i18n` for configuring locales, fallback languages, and translation messages.
 - `PluginControlOptions` from `@testforgejs/vue-test-core` for instance capturing and exposure mechanisms.
