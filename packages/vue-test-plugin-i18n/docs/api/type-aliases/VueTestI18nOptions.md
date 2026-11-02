[**@testforgejs/vue-test-plugin-i18n**](../README.md)

***

> **VueTestI18nOptions** = `I18nOptions`

Defined in: [types/types.ts:34](https://github.com/testforgejs/testforge/blob/bda9a30aec004080c96ffbad778f525b0ba976d6/packages/vue-test-plugin-i18n/src/types/types.ts#L34)

Configuration options for the Vue I18n test plugin.

Uses native Vue I18n options for configuring the i18n instance
created by TestForge.

Managed instance controls are provided separately by TestForge
through its plugin configuration types.

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

`I18nOptions` from `vue-i18n` for configuring locales,
fallback languages, and translation messages.
