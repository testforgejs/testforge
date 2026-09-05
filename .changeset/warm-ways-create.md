---
"@testforgejs/vue-test-preset-recommended-jest": major
"@testforgejs/vue-test-preset-recommended": major
"@testforgejs/vue-test-preset-base": major
"@testforgejs/vue-test-core": major
---

feat: introduce `PluginOptionsFactory` for preset plugin defaults

Preset plugin defaults are now defined as factory functions that return fresh plugin configuration objects instead of shared configuration objects. This prevents mutable plugin options from being shared between independent pipeline contexts.

This is a breaking change for custom presets: existing plugin defaults defined as plain objects must be migrated to option factories.

For example:

Before:

```typescript
defaults: {
  pinia: {
    initialState: {},
  },
}
```

After:

```typescript
defaults: {
  pinia: () => ({
    initialState: {},
  }),
}
```

When extending an existing preset, the base factory must be invoked explicitly if its options should be preserved.
