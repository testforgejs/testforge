---
"@testforge/vue-test-core": major
---

Move plugin overrides under `extraOptions.plugins`.

Before:

```ts
{
  pinia: false,
}
```

After:

```ts
{
  plugins: {
    pinia: false,
  },
}
```

Plugin overrides are now separated from framework-level extra options to prevent naming collisions and make the configuration structure explicit.
