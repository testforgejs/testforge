---
"@testforgejs/vue-test-core": major
---

**BREAKING CHANGE:** Rename `extraOptions.preset` to `extraOptions.presetKey`.

The new name explicitly identifies a preset by its key in the
preset registry, distinguishing preset selection from the
`PresetDefinition` supplied to `createTestFramework()`.

Replace:

```ts
factory(
  {},
  {},
  {},
  {
    preset: "admin",
  },
);
```

with:

```ts
factory(
  {},
  {},
  {},
  {
    presetKey: "admin",
  },
);
```

The `preset` and `presets` options in `createTestFramework()` remain unchanged.
