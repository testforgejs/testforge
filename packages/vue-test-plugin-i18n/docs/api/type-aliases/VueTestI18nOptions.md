[**@testforgejs/vue-test-plugin-i18n**](../README.md)

***

> **VueTestI18nOptions** = `I18nOptions` & `PluginControlOptions`\<`I18n`\>

Defined in: [types/types.ts:31](https://github.com/testforgejs/testforge/blob/1053183d328cec8560724e18b9e24c3d225082e9/packages/vue-test-plugin-i18n/src/types/types.ts#L31)

Configuration options for the Vue I18n test plugin.

Combines standard Vue I18n configuration (`I18nOptions` from `vue-i18n`)
with TestForge plugin control options.

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

 - I18nOptions for configuring locales, fallback languages, and translation messages.
 - PluginControlOptions for instance capturing and exposure mechanisms.
