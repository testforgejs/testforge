---
"@testforgejs/vue-test-preset-base": major
"@testforgejs/vue-test-plugin-primevue": minor
"@testforgejs/vue-test-plugin-vuetify": minor
"@testforgejs/vue-test-plugin-router": minor
"@testforgejs/vue-test-plugin-pinia": minor
"@testforgejs/vue-test-plugin-i18n": minor
"@testforgejs/vue-test-core": minor
"@testforgejs/vue-test-preset-recommended-jest": patch
"@testforgejs/vue-test-preset-recommended": patch
---

Move plugin default options from the base preset into their corresponding plugin packages.

Plugin modules can now expose their default configuration through
`getDefaultOptions()`, allowing presets to consume plugin-owned defaults
instead of defining plugin-specific configuration themselves.

`@testforgejs/vue-test-preset-base` no longer exports `defaultPinia`, `defaultI18n`, or `defaultRouter`. Consumers that relied on these exports should use the default options provided by the corresponding plugin modules.

Recommended Jest and Vitest presets now build on plugin-owned defaults while preserving their runner-specific configuration.
