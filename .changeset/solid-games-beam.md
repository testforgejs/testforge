---
"@testforge/vue-test-core": minor
---

feat: add type-safe support for component data overrides

Component state overrides are now inferred from the component definition.

TestForge validates the return value of `data()` in factory options and reports:

- unknown state properties;
- incompatible value types;
- invalid literal union values.

The implementation preserves Vue Test Utils behavior and typing semantics to keep migration straightforward.

This release introduces:

- `ComponentDataInput<T>`;
- typed `data()` support in `ComponentFactoryOptions`;
- automatic propagation of data types through `testComponentFactory()`;
- additional tsd coverage for component state validation.
