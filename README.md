# 1. Title

## TestForge — Declarative Test Infrastructure for Vue

> A test framework layer on top of [@vue/test-utils](https://test-utils.vuejs.org/) that eliminates mount boilerplate and scales Vue test architecture.

---

# 2. The problem every Vue project eventually hits

At the beginning, Vue tests look clean.

A simple component test:

```javascript
mount(MyComponent);
```

A few weeks later, real app infrastructure appears: i18n, Pinia, Router, stubs, and global mocks.

Suddenly, you hit the **Configuration Explosion** problem.

To test different behaviors of the _same_ component, you need slightly different environments:

- Test A needs a clean Pinia store.
- Test B needs the same store, but with one specific action mocked.
- Test C needs i18n set to `fr` instead of `en`.
- Test D needs the router to start on a specific protected path.

> Vue Test Utils forces you to maintain dozens of massive, slightly different configuration objects.
> You end up copy-pasting 30 lines of `mount()` boilerplate just to change a single boolean flag or locale string.

Now multiply this by 200+ tests. Your test suite becomes a nightmare to maintain:

- **Fragile Setup**: Changing a global dependency breaks 50 tests in unrelated files.
- **Hidden Intent**: The actual test logic is buried under a mountain of infrastructure wiring.
- **Maintenance Tax**: A simple refactor requires updating hundreds of boilerplate lines.

Your tests no longer describe what a component _does_.  
They describe **how to rebuild your entire enterprise Vue stack** from scratch.

---

# 3. The Idea: Context-Aware Overrides

TestForge introduces one simple shift in perspective:

> Separate the environment baseline from the specific test delta.

You define the infrastructure baseline **once** in a centralized factory. Individual tests never touch `global.plugins`. Instead, they pass lightweight, context-aware overrides that TestForge safely merges via its deterministic pipeline.

---

# 4. Before / After Example

## ❌ Vue Test Utils way (Configuration Explosion)

Look how much boilerplate you copy-paste across tests just to adjust _one_ tiny detail:

```javascript
// Test 1: Testing English locale
it("renders English greeting", () => {
  const wrapper = mount(MyComponent, {
    global: {
      plugins: [
        createI18n({ locale: "en", messages }),
        createTestingPinia({ initialState: { user: { loggedIn: true } } }),
        createRouter({ history: createMemoryHistory() }),
      ],
    },
  });
});

// Test 2: Testing French locale (30 lines copied just to change 'en' to 'fr')
it("renders French greeting", () => {
  const wrapper = mount(MyComponent, {
    global: {
      plugins: [
        createI18n({ locale: "fr", messages }), // 👈 The only changed line!
        createTestingPinia({ initialState: { user: { loggedIn: true } } }),
        createRouter({ history: createMemoryHistory() }),
      ],
    },
  });
});
```

## ✅ The TestForge Way (Clean Deltas)

You initialize a **reusable test factory** for the component. It pre-configures your standard Pinia, Router, and i18n via presets:

```javascript
const factory = testComponentFactory(MyComponent);
```

Now, your tests only declare **what changes**, keeping the setup purely declarative and laser-focused:

```javascript
// Test 1: Uses project defaults automatically
it("renders English greeting", () => {
  const wrapper = factory();
});

// Test 2: Safely overrides ONLY the i18n locale layer
it("renders French greeting", () => {
  const wrapper = factory({}, { i18n: { locale: "fr" } }); // 👈 Pure intent
});

// Test 3: Mutates only the required Pinia state block
it("renders guest view", () => {
  const wrapper = factory({}, { pinia: { initialState: { user: { loggedIn: false } } } });
});
```

---

# 5. Core Concepts

TestForge is built around a few ideas that work together.  
Individually they are simple. Together they remove almost all test setup noise.

---

## 5.1 Test Component Factory

The **Test Component Factory** is the entry point you use in tests.

You don’t call `mount` from [@vue/test-utils](https://test-utils.vuejs.org/) directly anymore.  
You create a factory once and reuse it.

```javascript
const factory = testComponentFactory(MyComponent);
```

Then in tests:

```javascript
factory({ title: "Hello" });
```

The factory:

- merges props
- applies presets
- activates plugins
- builds `global` config
- chooses `mount` / `shallowMount`
- runs the mount pipeline

All without the test knowing how.

> The test only describes what it wants, not how to assemble Vue.

---

## 5.2 Plugin System

TestForge treats i18n, Pinia, Router and any future integration as **plugins**.

A plugin is not a Vue plugin.  
It is a **test-environment builder**.

Each plugin:

- has a name
- knows how to create its Vue instance
- participates in the mount pipeline

Examples provided by TestForge:

- @testforge/vue-test-plugin-i18n
- @testforge/vue-test-plugin-pinia
- @testforge/vue-test-plugin-router

Because of this, TestForge can:

- validate plugin options
- control activation
- merge configs safely
- allow overrides without breaking defaults

---

## 5.3 Presets

A preset is a declarative description of a test environment.

It defines:

- which plugins exist
- which are enabled by default
- their default options

Example idea:

```javascript
// Example:
const presets = {
  default: {
    manifest: [
      { module: piniaPlugin, enabled: true },
      { module: i18nPlugin, enabled: true },
      { module: routerPlugin, enabled: false },
    ],
    defaults: {
      i18n: { locale: "en" },
      pinia: {
        /* initial state */
      },
    },
  },
};
```

Presets allow you to:

- share environment rules across the project
- switch environment in one line
- create lightweight or specialized test setups

TestForge provides:

- @testforge/vue-test-preset-recommended

You can create your own presets for your organization or monorepo.

---

## 5.4 Mount Pipeline

The **Mount Pipeline** is the internal engine that prepares the final mount options.

It is a deterministic sequence of middleware that:

1. Selects preset
2. Validates plugins
3. Resolves activation rules
4. Merges defaults, overrides, and extra options
5. Builds `global.plugins`, `global.stubs`, `global.mocks`
6. Produces clean options for `mount`

Because this is centralized:

- merge logic is predictable
- overrides behave consistently
- edge cases are tested once in TestForge, not in every project

---

## 5.5 Default vs Override Philosophy

TestForge follows a strict rule:

> Defaults should work for 90% of tests. Overrides should be explicit and safe.

This means:

- Empty options do something meaningful
- Providing an object can **override**, **extend**, or **reset** behavior depending on context
- Extra options can re-enable or reconfigure plugins safely
- Tests don’t need to know preset internals

You don’t fight the framework.  
You ask for what you need, and TestForge merges it correctly.

---

# 6. 📈 Incremental Migration from Vue Test Utils

TestForge is intentionally engineered as a **drop-in architecture extension**, not a destructive replacement. It features 100% backward compatibility with standard [Vue Test Utils (VTU)](https://vuejs.org) configuration formats.

You can migrate your existing test suites in two effortless, risk-free stages.

---

### Stage 1: Zero-Refactor Integration (1:1 Translation)

In the first stage, you don't need to change your existing setup objects. TestForge treats raw VTU configuration objects as valid input and processes them identically to `mount()`.

If your legacy VTU test looks like this:

```javascript
import { mount } from '@vue/test-utils';
import MyComponent from './MyComponent.vue';

const VTUConfig = {
  props: { title: "Hello" },
  global: {
    mocks: { \$t: (msg) => msg }
  }
};

const wrapper = mount(MyComponent, VTUConfig);
```

The immediate TestForge equivalent is exactly the same, routed through a reusable factory:

```javascript
import { testComponentFactory } from "@/tests/setup"; // Your bootstrapped factory
import MyComponent from "./MyComponent.vue";

const factory = testComponentFactory(MyComponent);

// Pass an empty object as the 1st argument (props) to let TestForge
// safely process the props directly out of your legacy VTUConfig block.
const wrapper = factory({}, VTUConfig);
```

At this stage, your tests will continue to pass exactly as they did before, with zero rewrite tax.

---

### Stage 2: Extracting the Baseline (Unlocking TestForge)

Once your tests run safely on the TestForge engine, you can incrementally refactor them to destroy boilerplate. You do this by extracting shared infrastructure into the factory creation level and leaving only the precise changes (deltas) in the individual tests.

#### 1. Move global configurations to the Factory level:

```javascript
// Do this once per test file (or move plugins to your global project Preset)
const factory = testComponentFactory(MyComponent, {}, {
  global: {
    mocks: { \$t: (msg) => msg } // Unified baseline
  }
});
```

#### 2. Clean up individual test invocations:

```javascript
// Now your tests only declare direct, meaningful state definitions
const wrapper = factory({ title: "Hello" });
```

By transitioning from Stage 1 to Stage 2, your test block shrinks from a heavy infrastructure-building machine down to a **one-line declarative intent**.
