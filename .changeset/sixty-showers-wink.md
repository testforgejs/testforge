---
"@testforgejs/vue-test-core": minor
---

Extend `withPluginInstance()` support to `defaultMountOptions.plugins` and `mountOptions.plugins`, in addition to `extraOptions.plugins`.

Pre-created plugin instances can now be shared across mounts through factory defaults or overridden for individual mounts. Instance metadata is resolved from the effective plugin configuration while preserving existing configuration precedence and isolation between pipeline runs.
