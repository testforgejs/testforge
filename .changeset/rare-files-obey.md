---
"@testforgejs/vue-test-core": major
---

**BREAKING CHANGE:** Introduce resolver-based component factory configuration to improve test isolation and prevent shared mutable defaults across mounts.

Factory creation APIs now accept resolver functions instead of static configuration objects:

- **Positional API:** `testComponentFactory(component, defaultPropsResolver?, defaultMountOptionsResolver?, defaultSlotsResolver?, config?)` now requires functions for default props, mount options, and slots when provided.
- **Object API:** `testComponentFactory.withOptions(optionsResolver)` now requires a function that returns the factory configuration.

Resolvers are evaluated independently for each mount, allowing fresh configuration objects to be created and preventing unintended state leakage between tests.

**Migration:**

```typescript
// Before
testComponentFactory(MyComponent, { title: "Default" });

testComponentFactory.withOptions({
  component: MyComponent,
  defaultProps: { title: "Default" },
});

// After
testComponentFactory(MyComponent, () => ({ title: "Default" }));

testComponentFactory.withOptions(() => ({
  component: MyComponent,
  defaultProps: { title: "Default" },
}));
```

The existing component mounting APIs remain unchanged:

- `factory(props, mountOptions, slots, extraOptions)`
- `factory.withOptions({ props, mountOptions, slots, extraOptions })`

Factory creation configuration returned by resolvers is validated when mounting, while static factory creation arguments are validated when the factory is created.
