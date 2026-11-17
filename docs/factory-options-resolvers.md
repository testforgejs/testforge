# Factory Options Resolvers

Factory options resolvers let TestForge create **fresh factory defaults for each component mount**, rather than reusing one mutable configuration object across tests.

This guide explains the resolver-based factory creation API, when resolvers run, how to avoid shared state, and how to migrate from static defaults.

> [!IMPORTANT]
> **Factory creation now uses resolver functions.** `testComponentFactory.withOptions()` accepts a function returning configuration, not a configuration object. In the positional API, the optional defaults arguments are functions too. **Mount invocation has not changed:** `factory.withOptions()` still accepts an object.

## 1. Why use resolvers?

A component factory can be created once and used in many tests. If its defaults contain mutable objects—such as arrays, mock services, plugin options, or initial state—reusing those objects may allow changes made during one test to affect another.

A **factory options resolver** is a function that returns the configuration for a component factory:

```typescript
const factory = testComponentFactory.withOptions(() => ({
  component: MyComponent,
  defaultProps: { items: [] },
  defaultMountOptions: {
    global: {
      mocks: {
        $api: { requests: [] },
      },
    },
  },
}));
```

The function `() => ({ ... })` is the resolver. TestForge calls it **once for every mount**, so the arrays and objects constructed inside it are new for each invocation.

This approach gives you control over object creation without requiring TestForge to deep-clone or freeze configuration.

## 2. Creating a factory

First, obtain `testComponentFactory` from your configured framework:

```typescript
import { createTestFramework } from "@testforgejs/vue-test-core";
import MyComponent from "./MyComponent.vue";

const { testComponentFactory } = createTestFramework();
```

### Object-based API (recommended)

Pass a resolver to `testComponentFactory.withOptions()`:

```typescript
const factory = testComponentFactory.withOptions(() => ({
  component: MyComponent,
  defaultProps: { title: "Hello" },
  defaultMountOptions: { shallow: true },
  defaultSlots: { default: () => "Fallback content" },
}));
```

The returned object supports these fields:

| Field                 | Purpose                                                           |
| --------------------- | ----------------------------------------------------------------- |
| `component`           | Vue component to mount (required)                                 |
| `defaultProps`        | Component props used as factory defaults                          |
| `defaultMountOptions` | Vue Test Utils options and TestForge-managed plugin configuration |
| `defaultSlots`        | Default slots for the component                                   |
| `presetKey`           | Optional name of a registered factory-level preset                |

Only `component` is required. The resolver should keep the component **stable across mounts**: the factory's TypeScript types are inferred from the component when the factory is created.

### Positional API

The positional form accepts the component followed by **three independent, optional defaults resolvers**:

```typescript
const factory = testComponentFactory(
  MyComponent,
  () => ({ title: "Hello" }),
  () => ({ shallow: true }),
  () => ({ default: () => "Fallback content" }),
);
```

The arguments are:

```typescript
// testComponentFactory(
//   component,
//   defaultPropsResolver?,
//   defaultMountOptionsResolver?,
//   defaultSlotsResolver?,
//   config?,
// )
```

Each supplied defaults resolver is invoked once per mount. Omit unused arguments or pass `undefined`; the component and fifth `config` argument are **not** resolvers.

For example, select a registered factory-level preset in the fifth argument:

```typescript
const factory = testComponentFactory(
  MyComponent,
  () => ({ title: "Hello" }),
  undefined,
  undefined,
  { presetKey: "admin" },
);
```

In the object-based API, `presetKey` belongs in the object returned by the resolver:

```typescript
const factory = testComponentFactory.withOptions(() => ({
  component: MyComponent,
  presetKey: "admin",
  defaultProps: { title: "Hello" },
}));
```

Here, `"admin"` must be registered in `createTestFramework({ presets })`. A mount-level `extraOptions.presetKey` can override the factory-level choice for one mount. See [Configuration & Advanced Usage](configuration.md) for preset selection and merge rules.

> [!NOTE]
> The **positional API remains supported**, but calls that previously supplied static default objects must now supply functions returning those objects. Calls without defaults, such as `testComponentFactory(MyComponent)`, are unchanged.

## 3. When resolvers run

Creating a factory does **not** execute its resolver(s). The resolver runs when you mount the component:

```typescript
const factory = testComponentFactory.withOptions(() => ({
  component: MyComponent,
  defaultProps: { title: "Hello" },
})); // Resolver is not called here.

factory(); // First resolver call.
factory(); // Second resolver call.
factory.withOptions({}); // Third resolver call.
```

For each mount, TestForge:

1. Calls the factory options resolver once, or calls each supplied positional defaults resolver once.
2. Validates the resolved component and defaults.
3. Combines factory defaults with the arguments for that mount, according to the normal TestForge configuration rules.
4. Runs the mount pipeline and mounts the component using Vue Test Utils.

Resolvers run for **every** mount, even if `skipDefaultProps`, `skipDefaultSlots`, or `skipDefaultOptions` causes some of their results to be ignored during configuration merging. These flags control which defaults are applied, **not** whether resolvers are executed.

A resolver must return its configuration synchronously; it is not an async initialization hook.

## 4. Factory creation vs. mount invocation

TestForge exposes two methods named `withOptions()`, but they work at different stages:

| Method                                       | Purpose                                       | Argument                                 |
| -------------------------------------------- | --------------------------------------------- | ---------------------------------------- |
| `testComponentFactory.withOptions(resolver)` | **Create** a reusable component factory       | Function returning factory configuration |
| `factory.withOptions(options)`               | **Mount** the component with per-call options | Plain configuration object               |

For example:

```typescript
// Factory creation: a resolver function is required.
const factory = testComponentFactory.withOptions(() => ({
  component: MyComponent,
  defaultProps: { title: "Default" },
}));

// Mount invocation: a plain object is required.
const wrapper = factory.withOptions({
  props: { title: "Overridden for this mount" },
  mountOptions: { shallow: true },
});
```

The returned factory also supports positional mounting:

```typescript
const wrapper = factory({ title: "Overridden for this mount" });
```

Both mounting forms use the same pipeline and return the same Vue Test Utils wrapper type. Mount-time arguments (`props`, `mountOptions`, `slots`, and `extraOptions`) have **not** become resolvers.

## 5. Data isolation: what resolvers do and do not guarantee

### Create mutable defaults inside the resolver

**Recommended:** construct new mutable values every time the resolver runs.

```typescript
const factory = testComponentFactory.withOptions(() => ({
  component: MyComponent,
  defaultMountOptions: {
    global: {
      mocks: {
        $service: {
          calls: [],
        },
      },
    },
  },
}));
```

**Avoid:** returning the same mutable configuration object from every invocation.

```typescript
const sharedOptions = {
  component: MyComponent,
  defaultMountOptions: {
    global: {
      mocks: { $service: { calls: [] } },
    },
  },
};

const factory = testComponentFactory.withOptions(() => sharedOptions);
// Every call returns the same nested objects.
```

Creating only a new outer object does not solve nested sharing:

```typescript
const sharedService = { calls: [] };

const factory = testComponentFactory.withOptions(() => ({
  component: MyComponent,
  defaultMountOptions: {
    global: { mocks: { $service: sharedService } },
  },
}));
// sharedService is still shared.
```

TestForge **does not automatically deep-clone, freeze, or reset** objects returned by a resolver. It guarantees resolver invocation, not that all returned references are unique. Objects imported from modules, captured from outer scopes, or created by singleton utilities may still be shared.

The same principle applies to the positional API: each resolver should return fresh mutable values instead of closing over a shared object.

### Reuse stable dependencies, including Vue components

**Factory options resolvers should create fresh configuration objects for each mount, but they do not need to recreate immutable or intentionally shared dependencies, such as Vue component definitions.**

For example, a component definition imported once can be registered in a newly created `global.components` object for every mount:

```typescript
import BaseButton from "./BaseButton.vue";

const factory = testComponentFactory.withOptions(() => ({
  component: MyComponent,
  defaultMountOptions: {
    global: {
      components: {
        BaseButton,
      },
    },
  },
}));
```

Each resolver call creates new `defaultMountOptions`, `global`, and `global.components` objects, while `BaseButton` continues to reference the same component **definition**. Vue creates component **instances** when mounting; reusing a definition does not, by itself, share instance state.

Treat shared component definitions as immutable. Mutating a definition or relying on mutable module-level state can still cause tests to affect one another. Likewise, intentionally shared services and plugin instances retain their state across mounts unless you create new instances.

### Reuse stateless Vue plugins across mounts

**Vue plugins can also be reused across mounts when they do not retain mutable state between installations.** Factory options resolvers should create fresh configuration containers, including the `global.plugins` array, but they do not need to recreate stateless plugin definitions. Plugins that maintain mutable state internally should be instantiated separately for each mount when isolation is required.

For example, an ordinary Vue plugin that does not retain installation state can be shared while its configuration containers are recreated:

```typescript
import type { App } from "vue";

const pluginA = {
  install(app: App) {
    app.config.globalProperties.$example = () => "Hello";
  },
};

const factory = testComponentFactory.withOptions(() => ({
  component: MyComponent,
  defaultMountOptions: {
    global: {
      plugins: [pluginA],
    },
  },
}));
```

Each mount gets a new `defaultMountOptions`, `global`, and `global.plugins` array; `pluginA` remains the same stateless plugin definition. If a plugin stores mutable data on itself or in a shared closure, use a factory such as `createPlugin()` **inside the resolver** to create a separate instance for each mount.

This guidance concerns **ordinary Vue plugins** registered through `global.plugins`. TestForge-managed plugins configured through `defaultMountOptions.plugins` have separate configuration and instance-lifecycle rules, described below.

### Reuse stateless Vue directives across mounts

**Vue directive definitions can be reused across mounts when they do not retain mutable state between hook invocations.** Factory options resolvers should create fresh configuration containers, including the `global.directives` object, but they do not need to recreate stateless directive definitions. Directives that retain mutable state internally should be instantiated separately for each mount when isolation is required.

For example, a directive that operates only on its bound element can be shared across mounts:

```typescript
const focusDirective = {
  mounted(el: HTMLElement) {
    el.focus();
  },
};

const factory = testComponentFactory.withOptions(() => ({
  component: MyComponent,
  defaultMountOptions: {
    global: {
      directives: {
        focus: focusDirective,
      },
    },
  },
}));
```

Each resolver call creates new `defaultMountOptions`, `global`, and `global.directives` objects, while `focusDirective` remains the same definition. If a directive stores mutable state in a shared closure or on its definition object, create that directive inside the resolver (for example, with `createDirective()`) when per-mount isolation is needed.

### Reuse Vue mixin definitions across mounts

**Vue mixin definitions can be reused across mounts when they do not retain shared mutable state.** A mixin's `data()` function should return fresh mutable data for each component instance. Factory options resolvers should create fresh configuration containers, including the `global.mixins` array, but they do not need to recreate mixin definitions that safely manage per-instance state.

A reusable mixin can be defined in a separate module and imported by application code and tests:

```typescript
// mixins/userMixin.ts
export const userMixin = {
  data() {
    return {
      profile: {
        name: "Original",
        roles: ["user"],
      },
    };
  },
};
```

Register the same mixin definition in a fresh `global.mixins` array for each mount:

```typescript
import { userMixin } from "./mixins/userMixin";

const factory = testComponentFactory.withOptions(() => ({
  component: MyComponent,
  defaultMountOptions: {
    global: {
      mixins: [userMixin],
    },
  },
}));
```

Each resolver call creates new `defaultMountOptions`, `global`, and `global.mixins` containers. The imported `userMixin` definition is reused, while Vue calls its `data()` function for each component instance. Since `data()` creates the nested `profile` and `roles` values inside the function, those values are not shared between instances.

Avoid returning references to mutable objects defined outside `data()`, or retaining mutable state in a shared closure. In that case, instances can still affect one another even though `data()` runs separately. A mixin registered through `global.mixins` applies to components in the Vue application created for that mount; importing a mixin alone does not register it globally.

### Mock functions and shared call history

**Mock functions created with `vi.fn()` or `jest.fn()` retain mutable call history and implementation state.** Factory options resolvers should create fresh `global.mocks` objects for each mount. When mock isolation is required, mock functions should also be created inside the resolver. Intentionally shared mock functions can be reused when their shared state is controlled explicitly.

For example, create a new mock function whenever the component is mounted:

```typescript
import { vi } from "vitest";

const factory = testComponentFactory.withOptions(() => ({
  component: MyComponent,
  defaultMountOptions: {
    global: {
      mocks: {
        $t: vi.fn((key: string) => key),
      },
    },
  },
}));
```

Each resolver call creates new `defaultMountOptions`, `global`, and `global.mocks` objects **and a new `$t` mock function**. Calls made during one mount do not accumulate in the mock created for another mount. For Jest, use `jest.fn()` instead of `vi.fn()`.

If a test intentionally needs to observe calls across multiple mounts, it can create a mock outside the resolver and return that same function in each new `global.mocks` object. In that case, the call history and mock implementation are shared; reset or otherwise manage them explicitly when necessary.

### Plugin options and plugin instances

Managed plugin defaults can include nested mutable state. Create these objects inside the appropriate factory or preset default-options function whenever isolation is required.

A resolver that calls `withPluginInstance(existingInstance)` still reuses **that same instance**. This is useful when sharing is intentional, but the instance's mutable state remains shared. To isolate plugin instances, create them separately for the relevant mount instead of reusing a pre-created instance.

Likewise, `captureInstance()` is intended for mount-level configuration, not shared `defaultMountOptions.plugins`. Create a fresh capture handle when an individual mount needs to access a managed instance.

See [Configuration & Advanced Usage](configuration.md#plugin-instances) for plugin instance lifecycle and configuration layering.

## 6. Migrating from static defaults

The change affects **factory creation**, not mounting an existing factory.

### Object-based creation

**Before:**

```typescript
const factory = testComponentFactory.withOptions({
  component: MyComponent,
  defaultProps: { title: "Hello" },
});
```

**After:** wrap the configuration in a function.

```typescript
const factory = testComponentFactory.withOptions(() => ({
  component: MyComponent,
  defaultProps: { title: "Hello" },
}));
```

### Positional creation

**Before:**

```typescript
const factory = testComponentFactory(
  MyComponent,
  { title: "Hello" },
  { shallow: true },
  { default: () => "Content" },
);
```

**After:** supply a resolver for each defaults argument.

```typescript
const factory = testComponentFactory(
  MyComponent,
  () => ({ title: "Hello" }),
  () => ({ shallow: true }),
  () => ({ default: () => "Content" }),
);
```

Note the two functions in `() => ({ default: () => "Content" })`: the **outer function** resolves factory defaults per mount; the **inner function** is the Vue Test Utils slot content callback.

You do **not** need to change these mount calls:

```typescript
factory();
factory({ title: "Custom title" });
factory.withOptions({ props: { title: "Custom title" } });
```

> [!IMPORTANT]
> Validation timing changes with deferred configuration. The positional API can validate its static `component`, `config`, and resolver argument types when the factory is created. Values **returned** by defaults resolvers, and configuration returned by the object-based resolver, are validated when the factory is mounted.

## 7. Common errors

### `Factory options resolver must be a function.`

**Cause:** an object was passed directly to `testComponentFactory.withOptions()`.

```typescript
// Incorrect
const factory = testComponentFactory.withOptions({ component: MyComponent });

// Correct
const factory = testComponentFactory.withOptions(() => ({ component: MyComponent }));
```

### `"defaultProps" must be a function.` (or another defaults argument)

**Cause:** a static object was passed to one of the positional defaults arguments.

```typescript
// Incorrect
const factory = testComponentFactory(MyComponent, { title: "Hello" });

// Correct
const factory = testComponentFactory(MyComponent, () => ({ title: "Hello" }));
```

The same rule applies to `defaultMountOptions` and `defaultSlots`.

### An error appears only when calling `factory()`

**Cause:** the resolver returned invalid configuration. Resolved values are validated at mount time, because they are not available during factory creation.

Ensure the resolver returns an object containing a valid `component`, with correctly shaped `defaultProps`, `defaultMountOptions`, `defaultSlots`, and a registered `presetKey` when specified.

### State still leaks between tests

**Cause:** the resolver returns references to shared mutable objects or intentionally reused plugin instances.

Move mutable object creation inside the resolver (or the relevant preset defaults factory), and avoid shared instances unless their reuse is deliberate.

## 8. Recommended practices

- Prefer the object-based creation API for readable, named factory configuration.
- Keep component definitions stable and reusable; recreate **mutable configuration containers and state** inside resolvers.
- Reuse stateless Vue plugin definitions when appropriate, but create new `global.plugins` arrays and isolate stateful plugin instances per mount.
- Reuse stateless Vue directive definitions when appropriate, but create new `global.directives` objects and isolate stateful directives per mount.
- Reuse Vue mixin definitions when `data()` creates independent per-instance state; create fresh `global.mixins` arrays for each mount.
- Create fresh `global.mocks` objects and mock functions inside resolvers when call-history isolation is required; explicitly manage intentionally shared mocks.
- Construct nested mutable state and plugin option objects inside resolvers when per-mount isolation matters.
- Use the positional API when independent resolvers are more convenient; each resolver remains optional.
- Use ordinary objects for per-mount `factory.withOptions({ ... })` calls.
- Do not rely on a resolver to clone or reset external singletons, shared services, or pre-created plugin instances.

For more about how factory defaults interact with per-mount options and managed plugins, see [Configuration & Advanced Usage](configuration.md). For initial setup, see [Getting Started](getting-started.md).

For exact factory signatures and public types, see the [Core API Reference](../packages/vue-test-core/docs/api/README.md).
