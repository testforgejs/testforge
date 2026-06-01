---
"@testforge/vue-test-core": major
---

feat: replace the custom `useShallow` option with the standard Vue Test Utils `shallow` option.

`ComponentFactoryOptions` now relies on the inherited `shallow` property from VTU's `MountingOptions`. Existing usages of:

```js
factory(
  {},
  {
    useShallow: false,
  },
);
```

should be updated to:

```js
factory(
  {},
  {
    shallow: false,
  },
);
```

Add shallowByDefault framework option.
