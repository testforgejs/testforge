# ⚙️ Configuration & Advanced Usage

This guide explains how to integrate TestForge into a project, configure the component factory, and use the framework's features.

## 1. 🚀 Integrating TestForge into a Project

It is recommended to create a single configuration file (usually `tests/setup.ts` or `tests/test-utils.ts`):

```typescript
// @/tests/setup.ts
import { createTestFramework } from "@testforge/vue-test-core";
import { presets } from "@testforge/vue-test-preset-recommended"; // or your own preset

const { testComponentFactory } = createTestFramework({
  presets,
  // shallowByDefault: true,   // optional; by default equal to false
});

export { testComponentFactory };
```

Now you can import this factory into any test:

```typescript
import { testComponentFactory } from "@/tests/setup";
import MyComponent from "@/components/MyComponent.vue";

const factory = testComponentFactory(MyComponent);

test("renders correctly", () => {
  const wrapper = factory();
  expect(wrapper.exists()).toBe(true);
});
```

### `createTestFramework` Parameters

| Parameter        | Type    | Default | Description                                       |
| :--------------- | :------ | :------ | :------------------------------------------------ |
| presets          | object  | —       | Required. Project preset registry                 |
| shallowByDefault | boolean | false   | Use `shallowMount()` by default for all factories |

---

## 2. 📝 Signature of `testComponentFactory`

The framework is fully compatible with [Vue Test Utils (VTU)](https://vuejs.org) and supports all standard mounting options.

```typescript
// 1. Factory Creation (File-Level Baseline)
const factory = testComponentFactory(
  Component,
  defaultProps?,        // Base properties for all tests in the file
  defaultMountOptions?, // Base Vue Test Utils & global configurations
  defaultSlots?         // Base slots for the component
);
```

```typescript
// 2. Factory Execution (Test-Level Delta)
const wrapper = factory(
  props?,               // Test-specific props (highest priority)
  mountOptions?,        // Test-specific VTU options & overrides
  slots?,               // Test-specific slots (highest priority)
  extraOptions?         // Advanced pipeline flags and control overlays
);
```

---

## 3. 🥞 The 4-Tier State Layering Hierarchy

When a plugin's configuration (like Pinia's `initialState` or Router's `routes`) is being resolved, it travels through four distinct architectural layers. Each layer corresponds to a specific lifecycle scope and applies a dedicated merging strategy to prevent test cross-contamination:

| Layer                               | Defined At               | Scope                             | Merge Strategy for Managed Plugins |
| :---------------------------------- | :----------------------- | :-------------------------------- | :--------------------------------- |
| **Layer 1: Preset Defaults**        | Global Framework Setup   | Whole Project / Monorepo          | Baseline configuration             |
| **Layer 2: `defaultMountOptions`**  | `testComponentFactory()` | Test File / Component Suite       | **Full Replacement (Override)**    |
| **Layer 3: `mountOptions`**         | `factory()` invocation   | Specific `it()` or `test()` block | **Full Replacement (Override)**    |
| **Layer 4: `extraOptions.plugins`** | `factory()` 4th argument | Precision local fine-tuning       | **Shallow Overlay (Patch)**        |

### Key Resolution Rules:

- **Immediate Intent Priority:** Direct `props` (1st argument) and `slots` (3rd argument) represent immediate test intent. They have the absolute highest priority and completely override any props or slots passed inside the `mountOptions` object.
- **State Reset vs Patching:** Managed plugins inside `mountOptions.plugins` (Layer 3) completely replace the previous layer's state to protect against **test data pollution**. For granular adjustments without wiping out the base state, use `extraOptions.plugins` (Layer 4).

## 4. 🔄 Merge Strategies

Different parts of the mounting configuration use different merge strategies. TestForge intentionally applies different algorithms depending on the type of data being merged.

### 4.1. Flat _Vue Test Utils (VTU)_ Options (Shallow Merge)

Standard Vue Test Utils mount options that are defined directly on `mountOptions` are resolved independently from managed plugin configuration.

These options include, for example:

- `data`
- `attrs`
- `attachTo`
- `attachToString`
- `shallow`
- other non-nested VTU mount options

Flat VTU options are merged using a **shallow merge** strategy between Layer 2 (`defaultMountOptions`) and Layer 3 (`mountOptions`).

When the same option is provided at both the factory level (`defaultMountOptions`) and the test level (`mountOptions`), the test-level value takes precedence.

For example:

```typescript
const factory = testComponentFactory(
  MyComponent,
  {},
  {
    attrs: {
      "data-testid": "factory-component",
    },
  },
);

factory(
  {},
  {
    attrs: {
      "data-testid": "test-component",
    },
  },
);
```

The resulting component receives:

```text
data-testid="test-component"
```

The test-level `mountOptions` value overrides the corresponding factory-level value.

#### The `shallow` Option

The `shallow` option is a special case because it can also be controlled globally through the `shallowByDefault` framework option.

- **`shallow` (Boolean)**: Standard **Vue Test Utils** option that controls whether the component is mounted using `mount()` or `shallowMount()`.
  - **Framework Default:** `false` (`mount()` is used).
  - **Global Override:** `createTestFramework({ shallowByDefault: true })` switches the framework default to use `shallowMount()`.
  - **Per-Test Override:** The `shallow` option inside `defaultMountOptions` or `mountOptions` always takes precedence over `shallowByDefault`.

Its **resolution order** is:

1. `mountOptions.shallow`
2. `defaultMountOptions.shallow`
3. Global `createTestFramework({ shallowByDefault })` configuration
4. `false`

This means that a more local configuration always takes precedence over a broader default.

**Example Usage:**

```typescript
import { presets } from "@testforge/vue-test-preset-recommended"; // or your own preset

// Global project configuration
const { testComponentFactory } = createTestFramework({
  presets,
  shallowByDefault: true,
});

// Factory defaults
const factory = testComponentFactory(
  MyComponent,
  {},
  {
    shallow: false,
  },
);

// Uses mount() because defaultMountOptions overrides shallowByDefault
factory();

// Uses shallowMount() because mountOptions overrides factory defaults
factory(
  {},
  {
    shallow: true,
  },
);
```

In this example:

- the framework defaults to `shallowMount()`;
- the factory changes the default to `mount()` for all tests created from it;
- an individual test can still override the behavior by passing `mountOptions.shallow`.

The important distinction is that `shallowByDefault` is a **framework-level fallback**, while `defaultMountOptions.shallow` and `mountOptions.shallow` are **local VTU configuration values**.

> **Note:** This section covers flat VTU mount options. The `global` option and managed plugin configuration follow separate resolution rules and are described in the following sections.

### 4.2. The `global` Section (Recursive Merge)

Standard VTU `global` options (`stubs`, `mocks`, `provide`) are processed using a **selective recursive merge** strategy across Layer 2 and Layer 3. This allows seamless "layering" of test-double infrastructure (e.g., adding a stub in a test does not wipe out base stubs defined in the factory).

#### Key Merge Rules:

- **Objects**: Merged recursively only on intersecting keys. Non-intersecting objects retain their original references (no deep cloning).
- **Arrays**: Combined into a unique set (union merge with deduplication).
- **Primitives**: Test-level values strictly overwrite factory-level values.

This is particularly useful for options such as:

- `stubs`
- `mocks`
- `provide`
- other nested `global` configuration

For example:

```typescript
const factory = testComponentFactory(
  MyComponent,
  {},
  {
    global: {
      stubs: {
        BaseButton: true,
      },
      mocks: {
        $api: mockApi,
      },
    },
  },
);

factory(
  {},
  {
    global: {
      stubs: {
        BaseModal: true,
      },
    },
  },
);
```

The resulting `global` configuration preserves the factory-level setup while adding the test-specific configuration:

```typescript
{
  global: {
    stubs: {
      BaseButton: true,
      BaseModal: true,
    },
    mocks: {
      $api: mockApi,
    },
  },
}
```

This allows a test to extend the existing VTU test environment without having to repeat the entire factory-level configuration.

> **Note:** Managed plugin configuration follows different rules. Plugin configuration inside `mountOptions.plugins` uses full replacement between layers, while `extraOptions.plugins` provides a shallow overlay for fine-grained adjustments. See [Managed Plugins Override](#43-managed-plugins-override-layer-2-vs-layer-3-vs-layer-4) for details.

### 4.3. Managed Plugins Override (Layer 2 vs Layer 3 vs Layer 4)

Because managed plugins control critical application state, their merging behavior is carefully designed to protect against **test data pollution**:

- **Full State Reset (Layers 2 & 3 via `plugins`)**: Inside both `defaultMountOptions` and `mountOptions`, managed plugin configurations are placed inside the `plugins` key (e.g., `mountOptions: { plugins: { pinia: { ... } } }`).
  - **Behavior:** When Layer 3 defines a plugin configuration block, it **completely replaces** that plugin's block from Layer 2 and Layer 1. This guarantees a clean, unpolluted state (e.g., a test-level `initialState` will completely discard the factory baseline state rather than merging keys).
- **Fine-Grained Patching (Layer 4 via `extraOptions.plugins`)**: If you do _not_ want to wipe out the inherited plugin configuration, but only want to tune a specific property, use the `plugins` property inside `extraOptions`.
  - **Behavior:** `extraOptions.plugins` acts as a **Shallow Overlay** on top of the already resolved plugin state.
  - _Example:_ If Layer 1 and 2 established a complex base store state, and your test only needs to toggle action stubbing without redeclaring that state, you pass it inside the 4th argument: `factory({}, {}, {}, { plugins: { pinia: { stubActions: true } } })`. The inherited state is preserved, and the stub flag is overlaid.

#### Why Do Layers 2 and 3 Use Full Replacement for Managed Plugins?

> [!IMPORTANT]
> Managed plugins control **application state** (`initialState`, `messages`, `routes`, etc.).  
> Deep merging could lead to **test data pollution**. For example:
>
> - Base configuration contains 10 users in `initialState`.
> - In a test you want an empty array.
>
> Deep merging could concatenate arrays instead of replacing them. That’s why on Layers 2 and 3 the plugin configuration **completely replaces** the previous one.

### 4.4. Props & Slots Priority

Direct arguments (`props` as 1st arg, `slots` as 3rd arg) represent immediate test intent. They have the absolute highest priority and will completely override any props or slots passed inside the `mountOptions` configuration object. If `props` or `slots` are specified both as direct factory arguments and inside `mountOptions`, the direct arguments always take precedence.

---

## 5. 🎛️ Execution Flags

### 5.1. `extraOptions` (4th argument)

Advanced framework-specific flags are isolated at the root level of the 4th argument (`extraOptions`) to keep them completely separate from business plugin configurations.

#### The `preset` Property

- **Type:** `keyof TestFrameworkPresets`
- **Description:** Allows dynamically switching or activating a specific preset profile from your project's presets registry for this individual factory call.

#### The `skipDefaultProps` / `skipDefaultSlots` Flags

- **Type:** `boolean` (Default: `false`)
- **Description:** If set to `true`, the factory completely ignores the `defaultProps` or `defaultSlots` specified during factory creation for this specific test run.

#### The `skipDefaultOptions` Flag

- **Type:** `boolean` (Default: `false`)
- **Description:** Tells the pipeline to completely ignore `defaultMountOptions` defined during factory creation, forcing the current test to resolve only against Global Preset Defaults and immediate `mountOptions`.

### 5.2. `mountOptions` (2nd argument)

#### The `skipManagedPlugins` Flag

- **Type:** `boolean` (Default: `false`)
- **Description:** Completely disables the active preset orchestration for the current test run. Use this when you need to take full manual control over plugin initialization using raw VTU arrays.

**When is it useful?**

Use this option when you need to **take full manual control** over plugin creation and registration, for example:

- when the default behavior of `createPiniaPlugin`, `createI18nPlugin` or `createRouterPlugin` conflicts with your test requirements
- when you want to use pre-created / mocked / stubbed plugin instances
- when plugins need to be registered in a custom order or with non-standard configuration

**Usage example:**

```typescript
const wrapper = factory(
  {},
  {
    skipManagedPlugins: true,
    global: {
      plugins: [
        customPiniaInstance,
        customRouterInstance, // manually created instances
      ],
    },
  },
);
```

---

## 6. 🛠 Managed Plugins

The framework provides enhanced support for several core Vue ecosystem plugins through a managed lifecycle pipeline.

Managed plugins participate in the TestForge plugin pipeline and provide capabilities beyond standard Vue Test Utils plugins.

Unlike raw Vue Test Utils plugins, they:

- participate in the preset system.
- support hierarchical configuration layering.
- support automatic plugin creation.
- support runtime overlays through `extraOptions.plugins`.
- are validated against the active preset manifest.

Examples of managed plugins include **Vue Router**, **Pinia**, **Vue I18n**, **Vuetify** and **PrimeVue**.

### 6.1. Configuration Levels (The 4-Layer Hierarchy)

Managed plugins can be configured across four distinct layers:

#### Layer 1: Preset Defaults (Project's global baseline)

```typescript
const { testComponentFactory } = createTestFramework({
  presets: {
    default: {
      manifest: [...],
      defaults: {
        pinia: {
          stubActions: true,
        },
      },
    },
  },
});
```

#### Layer 2: In `defaultMountOptions` (Factory level baseline)

```typescript
const factory = testComponentFactory(
  Component,
  {},
  {
    plugins: {
      pinia: {
        initialState: {
          user: { id: 1 },
        },
      },
    },
  },
);
```

#### Layer 3: In `mountOptions` (Specific test level override)

```typescript
factory(
  {},
  {
    plugins: {
      pinia: {
        initialState: {
          user: { id: 2 },
        },
      },
    },
  },
);
```

#### Layer 4: In `extraOptions.plugins` (Local fine-grained patch)

```typescript
// Base configuration (Layer 1 + 2): initialState + stubActions: true

factory(
  {},
  {},
  {},
  {
    plugins: {
      pinia: {
        stubActions: false, // Only changing this specific flag
        // initialState remains intact from previous layers
      },
    },
  },
);
```

> [!NOTE]
> Layer 4 acts as a **Shallow Overlay**, patching the already resolved configuration instead of replacing it entirely.

### 6.2. Configuration Validation

The framework performs strict validation:

- **Manifest Binding:** Keys passed into `defaults` (Layer 1) and `plugins` (Layers 2-4) must strictly correspond to plugins declared in the active preset’s manifest.
- **Value Constraints:** Plugin configuration values can only be an `Object` (options) or `false` (explicitly disabled).
- **Isolation of Third-Party Plugins:** Passing an unmanaged third-party plugin (e.g., `vfm`) directly into the `plugins` object will trigger an explicit framework error. Use `global.plugins` instead.

### 6.3. Practical Examples

#### Disabling a managed plugin completely

You can completely disable any managed plugin for a specific test by passing `false`:

```typescript
factory({}, { plugins: { router: false } });
```

This is highly useful when you need to run a baseline test with zero noise, or take full manual control over the global environment.

#### Overriding specific settings

```typescript
// Just change the locale
factory({}, { plugins: { i18n: { locale: "fr" } } });

// Changing Pinia's state
factory({}, { plugins: { pinia: { initialState: { user: { loggedIn: false } } } } });
```

#### Enabling a plugin that is disabled by default in the preset

```typescript
factory({}, { plugins: { router: {} } });
```

---

## 7. 🔌 Third-Party Plugins

Plugins that are not managed by the framework should be registered using the standard Vue Test Utils mechanism:

```typescript
factory(
  {},
  {
    global: {
      plugins: [createVfm()],
    },
  },
);
```

### Managed vs Third-Party Plugins

| Mechanism        | Purpose                                                            |
| ---------------- | ------------------------------------------------------------------ |
| `plugins`        | Managed plugins (`pinia`, `i18n`, `router`, `primevue`, `vuetify`) |
| `global.plugins` | Third-party Vue plugins                                            |

Managed plugins participate in the preset pipeline.  
Third-party plugins bypass the framework processing and are passed directly to Vue Test Utils.

---

> In most cases, the basic features described above are sufficient.
> If you need to work directly with plugin instances (Pinia, Router, etc.), see the **“Advanced: Working with Plugin Instances”** section.

## 8. 🛡 Advanced: Working with Plugin Instances

In most cases, you do not need to interact directly with plugin instances. However, doing so is useful when you need to assert the internal state of **Pinia**, **Vue Router**, or **Vue I18n** after a component has performed an action.

### 8.1. Using Pre-created Instances (`__meta.instance`)

Sometimes a test requires an **already existing** plugin instance (e.g., a Pinia instance pre-populated with state, or a fully configured Router) instead of letting the framework initialize a new one.

For this purpose, managed plugins support a protected `__meta.instance` property:

```typescript
import { createTestingPinia } from "@pinia/testing";

const sharedPinia = createTestingPinia();

factory(
  {},
  {},
  {},
  {
    plugins: {
      pinia: {
        __meta: {
          instance: sharedPinia,
        },
      },
    },
  },
);
```

**When `__meta.instance` is provided:**

- Plugin creation is completely skipped.
- Plugin configuration options are ignored.
- The supplied instance is injected directly into Vue Test Utils.

> [!WARNING]
> Any other plugin options specified alongside `__meta.instance` are ignored because the provided instance takes priority.

**Why is this better than `global.plugins`?**

Using `__meta.instance` allows the framework to recognize that the managed plugin already exists. This prevents the framework from spinning up a second instance, avoiding conflicts between multiple copies of the same plugin and keeping the lifecycle consistent with the preset pipeline.

**When should `__meta.instance` be used?**

- When you need to reuse the exact same plugin instance across multiple tests.
- When you want to manually prepare a complex, multi-step runtime state before mounting the component.

Providing `__meta.instance` is mainly useful for plugins that maintain
runtime state, such as **Pinia** or **Vue Router**.
Plugins implemented as install objects or install tuples typically do not benefit from instance reuse because they do not expose meaningful runtime state.

---

### 8.2. Accessing Plugin Instances

Sometimes tests need direct access to the actual plugin instance created by the framework pipeline to run assertions against it.

#### Option A: Using `expose`

You can pass an `expose` callback function which receives the freshly created instance immediately before the component mounts.

```typescript
import type { Pinia } from "pinia";

let piniaInstance: Pinia;

factory(
  {},
  {
    plugins: {
      pinia: {
        expose(instance) {
          piniaInstance = instance as Pinia;
        },
      },
    },
  },
);
```

#### Option B: Using `captureInstance` (Recommended)

`captureInstance()` is a convenient helper built on top of `expose` that stores the instance reference inside a wrapper object for clean access in assertions.

```typescript
const piniaCapture = captureInstance();

factory(
  {},
  {
    plugins: {
      pinia: {
        ...piniaCapture,
      },
    },
  },
);

expect(piniaCapture.instance).toBeDefined();
```

After mounting, the captured instance can be inspected or manipulated directly in the test.

> [!TIP]
> **Full TypeScript Support:** You do not need to pass explicit generic types to `captureInstance()`. The framework automatically infers the correct plugin type (`Pinia`, `I18n`, etc.) based on the context object key where the capture helper is spread.

> [!NOTE]
> Plugin instances are created before component mounting. Both the `expose` callback and `captureInstance()`
> receive the instance immediately before `mount()` or `shallowMount()` is executed.

### 8.3. Instance Isolation

Every call to `factory()` creates a completely new runtime environment.

Pinia, Router and i18n instances are never shared between factory invocations.

Captured instances from previous tests have no relation to instances created in subsequent tests.
