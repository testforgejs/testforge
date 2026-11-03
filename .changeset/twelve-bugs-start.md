---
"@testforgejs/vue-test-core": minor
---

Add an object-based component mounting API through `factory.withOptions()`.

The new API accepts named `props`, `mountOptions`, `slots`, and `extraOptions` fields as an alternative to positional arguments.

Both invocation styles share the same configuration resolution pipeline, preset selection, plugin lifecycle, and TypeScript inference. Existing positional calls remain fully supported.
