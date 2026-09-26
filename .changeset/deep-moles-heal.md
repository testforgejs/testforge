---
"@testforgejs/vue-test-preset-recommended-jest": major
"@testforgejs/vue-test-preset-recommended": major
"@testforgejs/vue-test-plugin-router": major
"@testforgejs/vue-test-plugin-pinia": major
"@testforgejs/vue-test-plugin-i18n": major
"@testforgejs/vue-test-preset-base": major
---

Redesign plugin default options around minimal, project-independent integration baselines.

Plugin defaults now avoid application-specific policy and preserve upstream library behavior unless TestForge needs to override it for reliable or consistent integration.

### Pinia

Pinia defaults no longer set `initialState: {}` or `stubActions: false`.

The plugin now only provides runner integration through `createSpy` when a test runner is supplied. As a result, `@pinia/testing` defaults are preserved, including stubbing actions by default.

Projects that rely on real action execution should configure it explicitly:

```typescript
pinia: () => ({
  stubActions: false,
  createSpy: vi.fn,
});
```

### Vue Router

Router defaults now always use `createMemoryHistory()` and an empty route table.

TestForge no longer selects browser history based on the presence of `window` and no longer creates a synthetic `/` route.

Projects that depend on application routes or browser history should provide them explicitly in their preset.

### Vue I18n

Vue I18n defaults now contain only:

```typescript
{
  legacy: false,
  globalInjection: true,
}
```

TestForge no longer selects an application locale or fallback locale, provides an empty message catalog explicitly, or suppresses missing/fallback warnings.

Projects that depend on specific locales, messages, fallback behavior, or warning policy should configure those options explicitly.

These changes also affect the base, recommended, and recommended-jest presets because they explicitly consume the plugin-provided defaults.
