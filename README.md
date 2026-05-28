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

A few weeks later, real app infrastructure appears:

- i18n
- Pinia stores
- Router
- global plugins
- stubs
- mocks
- default config

> And every test slowly turns into a 30-line mount() configuration you copy-paste across the project.

Now multiply this by 200+ tests.

You start seeing:

- copy-paste mount configs everywhere
- tests coupled to infrastructure
- painful refactors when config changes
- no standard way to build the test environment
- impossible to share setup across packages
- presets? plugins? conventions? — all manual

Your tests no longer describe behavior.

They describe **how to assemble Vue**.

---

# 3. The Idea (What TestForge changes)

TestForge introduces one simple idea:

> Separate what you test from how the test environment is built

You stop writing `global.plugins` in tests. Ever.

That’s it.

No i18n.  
No Pinia.  
No Router.  
No boilerplate.

Because TestForge builds the mount environment for you using:

- a plugin system
- presets
- a deterministic mount pipeline
- deep/controlled merge strategy
- infrastructure defaults with clean overrides

Your tests go back to describing **component behavior**, not Vue wiring.

---

# 4. Before / After Example

## ❌ Vue Test Utils way

```javascript
mount(MyComponent, {
  props: { ... },
  global: {
    plugins: [
      createI18n({ locale: 'en', messages }),
      createTestingPinia({ initialState, stubActions: false }),
      createRouter({ history: createMemoryHistory(), routes }),
    ],
    stubs: { ... },
    mocks: { ... },
  },
})
```

## ✅ TestForge way

Instead, you define a **test factory** _ONCE_:

```javascript
const factory = testComponentFactory(MyComponent);
```

The same test becomes:

```javascript
factory({ title: "Hello" });
```

No plugins.  
No globals.  
No infrastructure in sight.

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
