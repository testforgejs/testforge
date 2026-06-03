---
"@testforge/vue-test-core": major
---

fix: validate `extraOptions.plugins` against the active preset plugin whitelist

Previously, unsupported plugins passed through `extraOptions.plugins` without validation.
Now the framework throws an error when a plugin is configured that is not supported by the active preset.

Example:

```js
extraOptions: {
  plugins: {
    vuetify: {
    }
  }
}
```
