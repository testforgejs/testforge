---
"@testforgejs/vue-test-plugin-primevue": minor
---

feat: added initial support for PrimeVue integration via `@testforgejs/vue-test-plugin-primevue`

The plugin supports install-based Vue plugins by producing
Vue Test Utils compatible plugin tuples:

```ts
plugins: {
  primevue: {
    ripple: true,
  },
}
```

This implementation also serves as a reference example for
non-instance Vue plugin integrations within TestForge.
