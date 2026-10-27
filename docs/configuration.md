# ⚙️ Configuration & Advanced Usage

This guide explains how TestForge resolves configuration and provides advanced controls for component tests.

It covers:

- the `testComponentFactory` API
- the four-tier configuration layering model
- merge strategies for Vue Test Utils and managed plugin options
- execution controls and runtime overlays
- managed plugin configuration and validation
- preset composition
- third-party Vue Test Utils plugins
- advanced plugin instance handling.

If you are new to TestForge, start with the [Getting Started Guide](getting-started.md).

> [!NOTE]
> This guide covers configuration and advanced usage, not package installation.
>
> TestForge plugin packages imported directly by project code must be installed as direct project dependencies.
>
> See the [Getting Started Guide](getting-started.md) for installation and initial project setup.

## Table of Contents

- [1. `testComponentFactory` Signature](#testcomponentfactory-signature)
- [2. The 4-Tier Configuration Layering Model](#configuration-layers)
- [3. Merge Strategies](#merge-strategies)
  - [3.1. Top-Level Vue Test Utils Options](#flat-vtu-options)
  - [3.2. The `global` Section](#global-options)
  - [3.3. Managed Plugin Configuration](#managed-plugin-configuration)
  - [3.4. Props and Slots Priority](#props-slots-priority)
- [4. Execution Flags](#execution-flags)
- [5. Managed Plugins](#managed-plugins)
  - [5.1. Preset Manifest Declaration](#51-preset-manifest-declaration)
  - [5.2. Preset Composition with `extendPreset()`](#52-preset-composition-with-extendpreset)
  - [5.3. Configuration Validation](#53-configuration-validation)
  - [5.4. Practical Examples](#54-practical-examples)
- [6. Third-Party Plugins](#third-party-plugins)
- [7. Advanced: Working with Plugin Instances](#plugin-instances)
  - [7.1. Using Pre-created Instances (`withPluginInstance()`)](#precreated-plugin-instances)
  - [7.2. Accessing Plugin Instances](#accessing-plugin-instances)
  - [7.3. Plugin Instance Dependencies](#plugin-instance-dependencies)
  - [7.4. Instance Isolation](#instance-isolation)

<a id="testcomponentfactory-signature"></a>

## 1. 📝 `testComponentFactory` Signature

`testComponentFactory` creates a reusable factory for mounting a specific component.

Define shared props, slots, Vue Test Utils options, and plugin configuration once, then override them for individual tests.

### Factory Creation

```typescript
const factory = testComponentFactory(
  Component,
  defaultProps, // optional
  defaultMountOptions, // optional
  defaultSlots, // optional
);
```

These arguments define factory-level defaults applied to every mount created by the factory.

- `Component` — the Vue component to mount.
- `defaultProps` — default component props.
- `defaultMountOptions` — default Vue Test Utils mounting options and managed plugin configuration. Pre-created instances may be supplied with `withPluginInstance()`, but instance capturing is not allowed at this shared factory level.
- `defaultSlots` — default component slots.

### Factory Execution

```typescript
const wrapper = factory(
  props, // optional
  mountOptions, // optional
  slots, // optional
  extraOptions, // optional
);
```

These arguments configure a single component mount.

- `props` — test-specific component props.
- `mountOptions` — test-specific Vue Test Utils options and managed plugin configuration.
- `slots` — test-specific component slots.
- `extraOptions` — advanced framework controls and runtime plugin overlays.

The following sections explain how these options are resolved and merged.

---

<a id="configuration-layers"></a>

## 2. 🥞 The 4-Tier Configuration Layering Model

TestForge combines configuration from four sources, each with its own scope and purpose. For managed plugins, these sources do **not** form a simple sequence of four full replacements.

Instead, TestForge resolves the runtime options from Layers 2–4, then performs a **final shallow merge** with the preset defaults from Layer 1. The resolved runtime options take precedence over matching preset properties.

For a broader architectural perspective on how presets and runtime
configuration work together, see

[Presets and the Runtime Configuration Pipeline](./architecture.md#presets-and-the-runtime-configuration-pipeline).

| Layer                               | Defined At                    | Scope                 | Managed Plugin Behavior                                               |
| :---------------------------------- | :---------------------------- | :-------------------- | :-------------------------------------------------------------------- |
| **Layer 1: Preset Defaults**        | `createTestFramework()`       | Project-wide baseline | Provides the base configuration for managed plugins                   |
| **Layer 2: `defaultMountOptions`**  | `testComponentFactory()`      | Component factory     | Provides factory-level plugin options that can override preset values |
| **Layer 3: `mountOptions`**         | `factory()`                   | Individual mount      | Replaces Layer 2 options for the same plugin                          |
| **Layer 4: `extraOptions.plugins`** | `factory()` (fourth argument) | Individual mount      | Applies a shallow overlay to the resolved runtime plugin options      |

> [!IMPORTANT]
> Layer 3 replaces **Layer 2 configuration for the same plugin**, not that plugin's preset defaults.
>
> A plugin declared with `enabled: false` in the preset manifest can still be activated through `defaultMountOptions.plugins`, `mountOptions.plugins`, or `extraOptions.plugins`. Once activated, its preset defaults remain available as the base configuration during the final merge.
>
> An explicit runtime configuration value of `false` disables the plugin and prevents its preset defaults from being merged.
>
> See [Managed Plugin Configuration](#managed-plugin-configuration) for the full resolution rules and an example using all four layers.

### Layer 1: Preset Defaults

Preset defaults establish the baseline options for managed plugins in the active runtime environment.

Each default is a `PluginOptionsFactory`, which TestForge invokes when resolving the active preset. For example, a project-owned preset can configure Pinia for Vitest:

```typescript
import { vi } from "vitest";
import { createTestFramework } from "@testforgejs/vue-test-core";
import { piniaPlugin, PLUGIN_NAME as PINIA_PLUGIN_NAME } from "@testforgejs/vue-test-plugin-pinia";

const preset = {
  manifest: [
    {
      module: piniaPlugin,
      enabled: true,
    },
  ],
  defaults: {
    [PINIA_PLUGIN_NAME]: () => ({
      createSpy: vi.fn,
    }),
  },
};

const { testComponentFactory } = createTestFramework({
  preset,
});
```

Preset factories allow TestForge to obtain fresh options for each resolution instead of relying on a single mutable configuration object. To create independent values, the factory must actually return new objects:

```typescript
const defaultPinia = () => ({
  initialState: {},
  stubActions: true,
});

const first = defaultPinia();
const second = defaultPinia();

first !== second; // true
```

This is especially useful for mutable options such as Pinia state, Vue Router routes, and Vue I18n messages. A preset factory can also create fresh runtime objects, such as a new Router history, on each invocation.

However, only objects created inside the factory are necessarily new. If the factory returns references to objects created elsewhere, those objects retain their identity and may be shared across mounts. TestForge does not automatically clone or recreate them.

See [Instance Isolation](#instance-isolation) for details on reference sharing and mount-specific objects.

During the final plugin configuration merge, TestForge combines preset defaults with the already resolved runtime options. Properties from the preset remain available unless they are overridden by runtime options. The merge is shallow: matching nested values are replaced rather than recursively merged.

If a plugin is explicitly disabled with `false`, it remains disabled and its preset defaults are not applied.

Managed plugins must be declared in the active preset manifest before they can be configured through the managed `plugins` API. Preset composition is covered separately in [Section 5.2](#52-preset-composition-with-extendpreset).

---

### Layer 2: `defaultMountOptions`

Define factory-level defaults when creating a component factory:

```typescript
const factory = testComponentFactory(
  MyComponent,
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

This configuration serves as the baseline for every mount created by the component factory. For managed plugins, its properties can override matching preset values while unrelated preset properties remain available during the final merge.

> [!NOTE]
> Stateful objects supplied through `defaultMountOptions` may be shared across mounts. TestForge does not automatically clone or recreate them. See [Instance Isolation](#instance-isolation) for details.
>
> **Pre-created instances are allowed in `defaultMountOptions.plugins`.** Use `withPluginInstance(instance)` when a factory intentionally shares the same prepared instance across mounts. Its mutable state is shared too. See [Using Pre-created Instances](#precreated-plugin-instances).
>
> **Instance capture is not allowed in `defaultMountOptions.plugins`.** Create a fresh `captureInstance<T>()` for each mount and provide it through `mountOptions.plugins` or `extraOptions.plugins`.

---

### Layer 3: `mountOptions`

Provide test-specific configuration when invoking a component factory:

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

For managed plugins, configuration supplied at this layer **replaces the corresponding Layer 2 configuration as a whole**. Properties from the factory-level configuration that are not repeated at Layer 3 are discarded for that plugin.

This replacement does **not** discard the preset defaults. They are still used as the base during the final merge, except where overridden by the resolved runtime options.

Replacement prevents an individual test from unintentionally inheriting unrelated factory-level plugin settings.

This also applies to pre-created instances. A `withPluginInstance()` value in `mountOptions.plugins.<name>` replaces one from `defaultMountOptions.plugins.<name>`. Supplying ordinary plugin options at Layer 3 instead removes the factory-level pre-created instance for that plugin; TestForge then uses its normal instance-creation path. See [Using Pre-created Instances](#precreated-plugin-instances).

---

### Layer 4: `extraOptions.plugins`

The fourth layer makes targeted adjustments to managed plugin options:

```typescript
factory(
  {},
  {},
  {},
  {
    plugins: {
      pinia: {
        stubActions: false,
      },
    },
  },
);
```

Unlike `mountOptions.plugins`, this layer does not replace the entire configuration for a plugin. It applies a **shallow overlay** to the runtime configuration resolved from Layers 2 and 3, **before** the final merge with preset defaults.

For example, if the runtime options contain:

```typescript
{
  initialState: {
    user: { id: 1 },
  },
  stubActions: true,
}
```

and the Layer 4 overlay specifies:

```typescript
{
  stubActions: false,
}
```

the overlaid runtime configuration becomes:

```typescript
{
  initialState: {
    user: { id: 1 },
  },
  stubActions: false,
}
```

The existing `initialState` is preserved. The final merge then adds any preset properties that are still missing from these runtime options.

To **disable an entire managed plugin**, use `false` as the value of that plugin entry (not as a property inside its options object):

```typescript
factory(
  {},
  {},
  {},
  {
    plugins: {
      pinia: false,
    },
  },
);
```

This explicit Layer 4 `false` takes precedence over an enabled configuration or a `withPluginInstance()` value supplied by Layers 2 or 3. The plugin remains disabled for that mount, and its preset defaults are not merged. An options object at Layer 4, by contrast, acts as an overlay and can enable a plugin disabled by an earlier layer.

> [!NOTE]
> Use `mountOptions.plugins` to replace a plugin's factory-level configuration for a specific test.
>
> Use `extraOptions.plugins` to override individual top-level properties without redeclaring the entire runtime configuration.

---

<a id="merge-strategies"></a>

## 3. 🔄 Merge Strategies

TestForge uses different strategies depending on the part of the configuration being resolved. Standard top-level Vue Test Utils options, `global`, and managed plugin options do not all follow the same rules.

<a id="flat-vtu-options"></a>

### 3.1. Top-Level Vue Test Utils Options

Top-level Vue Test Utils options are resolved from factory-level `defaultMountOptions` and test-level `mountOptions` using a **shallow merge**. When both layers specify the same option, the test-level value takes precedence.

Examples include:

- `data`
- `attachTo`
- `shallow`
- other top-level VTU mounting options.

The `attrs` option also participates in mount configuration resolution; TestForge processes it through a dedicated pipeline step.

For example:

```typescript
const factory = testComponentFactory(
  MyComponent,
  {},
  {
    shallow: false,
    attachTo: "#app",
  },
);

factory(
  {},
  {
    shallow: true,
  },
);
```

The effective configuration retains `attachTo` from the factory defaults and uses `shallow: true` from the test-level options.

#### The `shallow` Option

The `shallow` setting determines whether TestForge calls Vue Test Utils `mount()` or `shallowMount()`.

TestForge also supports a framework-level `shallowByDefault` option:

```typescript
import { createTestFramework } from "@testforgejs/vue-test-core";
import { presets } from "@testforgejs/vue-test-preset-recommended";

export const { testComponentFactory } = createTestFramework({
  preset: presets.default,
  shallowByDefault: true,
});
```

When `shallowByDefault` is enabled, factories use shallow mounting unless a more specific `shallow` value is provided. The priority order, from highest to lowest, is:

1. `mountOptions.shallow`
2. `defaultMountOptions.shallow`
3. `shallowByDefault`
4. `false`

For example:

```typescript
const { testComponentFactory } = createTestFramework({
  preset: presets.default,
  shallowByDefault: true,
});

const factory = testComponentFactory(
  MyComponent,
  {},
  {
    shallow: false,
  },
);

// Uses mount() because the factory explicitly sets shallow: false.
factory();

// Uses shallowMount() because test-level configuration takes precedence.
factory(
  {},
  {
    shallow: true,
  },
);
```

> [!NOTE]
> The `global` object and managed plugin configuration have separate resolution rules, explained below.

---

<a id="global-options"></a>

### 3.2. The `global` Section

Standard VTU `global` options, including `stubs`, `mocks`, and `provide`, use a **selective recursive merge** between Layer 2 (`defaultMountOptions`) and Layer 3 (`mountOptions`). This lets individual tests add mocks or stubs without removing unrelated factory-level configuration.

#### Key Merge Rules

- **Objects** — recursively merged when corresponding keys exist in both configurations. Objects that do not require merging retain their references; they are not deep-cloned.
- **Arrays** — combined using a union merge that removes duplicates.
- **Primitives** — test-level values override factory-level values.

For example:

```typescript
const mockApi = {
  getUser: () => Promise.resolve({ id: 1 }),
};

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
      mocks: {
        $store: {},
      },
    },
  },
);
```

The effective `global` configuration preserves the factory-level setup and adds the test-specific values:

```typescript
{
  global: {
    stubs: {
      BaseButton: true,
      BaseModal: true,
    },
    mocks: {
      $api: mockApi,
      $store: {},
    },
  },
}
```

This is useful when a component factory provides shared test infrastructure and individual tests need to modify only part of it.

> [!NOTE]
> Do not confuse the `global` merge strategy with managed plugin configuration. Managed plugins use replacement between Layers 2 and 3, a shallow Layer 4 overlay, and a separate final merge with preset defaults.

---

<a id="managed-plugin-configuration"></a>

### 3.3. Managed Plugin Configuration

Managed plugin options have different resolution rules from standard Vue Test Utils options. They can include application state and references to runtime objects, so TestForge does not indiscriminately deep-merge or clone them.

Managed plugins control plugin-specific configuration such as:

- Pinia `initialState`
- Vue I18n `messages` and `locale`
- Vue Router `routes`
- plugin-specific options for Vuetify, PrimeVue, PrimeVue 3, and other supported integrations.

Because these options can represent application state, blindly deep-merging them can produce unexpected test behavior.

Managed plugin configuration is resolved in **three steps**: replacement between Layers 2 and 3, a shallow overlay (or explicit `false` override) from Layer 4, and a final shallow merge with preset defaults from Layer 1. After merging, TestForge normalizes `withPluginInstance()` metadata from the effective configuration, regardless of the layer that supplied it. Instance references declared with `fromPluginInstance()` are resolved using only that effective configuration. See [Plugin Instance Dependencies](#plugin-instance-dependencies).

#### Step 1: Replace Layer 2 with Layer 3 When Provided

If `mountOptions.plugins` contains a configuration for a managed plugin, it replaces that plugin's configuration from `defaultMountOptions.plugins` **as a whole**. These two configurations are not deep-merged.

For example, a factory can define an initial Pinia state:

```typescript
const factory = testComponentFactory(
  MyComponent,
  {},
  {
    plugins: {
      pinia: {
        initialState: {
          users: [{ id: 1 }, { id: 2 }],
        },
      },
    },
  },
);
```

An individual test can replace it:

```typescript
factory(
  {},
  {
    plugins: {
      pinia: {
        initialState: {
          users: [],
        },
      },
    },
  },
);
```

The resolved test-level `initialState` contains `users: []`; it is not deep-merged with the factory-level array. This prevents stale or unrelated test data from leaking into another test.

> [!NOTE]
> Replacement occurs at the **plugin configuration object** level, not per property. Instance capture is not permitted in Layer 2; configure `captureInstance()` per mount in Layer 3 (`mountOptions.plugins`) or Layer 4 (`extraOptions.plugins`).
>
> This replacement does **not** remove the plugin's preset defaults.

Replacing Layer 2 configuration with Layer 3 helps prevent unintended state inheritance between tests and makes test-specific configuration explicit. When only individual plugin options need to change, use the Layer 4 shallow overlay instead.

#### Step 2: Apply the Layer 4 Shallow Overlay

`extraOptions.plugins` lets a test adjust individual top-level properties of an enabled runtime plugin configuration without replacing it entirely. Assigning `false` to the plugin entry is an explicit disabling override, not an object overlay.

The overlay is applied to the plugin configuration already resolved from Layers 2 and 3. Matching top-level properties are overridden, while other properties are preserved.

For example:

```typescript
factory(
  {},
  {},
  {},
  {
    plugins: {
      pinia: {
        stubActions: true,
      },
    },
  },
);
```

If the runtime configuration contains:

```typescript
{
  initialState: {
    users: [{ id: 1 }],
  },
  stubActions: false,
}
```

and the overlay supplies:

```typescript
{
  stubActions: true,
}
```

The resulting runtime configuration retains `initialState` and uses `stubActions: true`.

The overlay is applied **before** the final merge with preset defaults.

To disable a plugin at this layer, use `extraOptions.plugins.<name> = false`. This takes precedence over any configuration from `defaultMountOptions` or `mountOptions`, including a pre-created instance. It also prevents the final preset-default merge from re-enabling the plugin.

#### Step 3: Shallow-Merge Preset Defaults with Runtime Options

After resolving Layers 2–4, TestForge performs a final shallow merge for each managed plugin:

```typescript
{
  ...presetDefaults,
  ...resolvedRuntimeOptions,
}
```

This operation has the following rules:

- Preset defaults form the base configuration.
- Resolved runtime options take precedence over matching preset properties.
- Preset properties that are not overridden remain available.
- Nested objects are **replaced**, not recursively merged, when their top-level keys collide.
- An explicitly disabled plugin (`false`) remains disabled; TestForge does not restore it from preset defaults.

**Example: All Four Layers**

Suppose preset defaults contain:

```typescript
{
  presetOnly: true,
  sharedOption: "preset",
}
```

Layer 2 (`defaultMountOptions.plugins`) supplies:

```typescript
{
  factoryOnly: true,
  sharedOption: "factory",
}
```

Layer 3 (`mountOptions.plugins`) supplies:

```typescript
{
  mountOnly: true,
  sharedOption: "mount",
}
```

Layer 4 (`extraOptions.plugins`) supplies:

```typescript
{
  extraOnly: true,
  sharedOption: "extra",
}
```

First, Layer 3 replaces Layer 2, so `factoryOnly` is discarded. Next, Layer 4 overlays the remaining runtime options. Finally, TestForge shallow-merges the result with the preset defaults.

The effective configuration is:

```typescript
{
  presetOnly: true,
  mountOnly: true,
  extraOnly: true,
  sharedOption: "extra",
}
```

Here, `presetOnly` survives from the preset; `mountOnly` and `extraOnly` come from the runtime layers; `factoryOnly` is absent; and the Layer 4 value of `sharedOption` takes precedence.

**Example: Nested Values Are Not Deep-Merged**

If the preset defines:

```typescript
{
  nested: {
    presetOnly: true,
  },
}
```

and the resolved runtime options define:

```typescript
{
  nested: {
    mountOnly: true,
  },
}
```

the final result is:

```typescript
{
  nested: {
    mountOnly: true,
  },
}
```

The preset's nested `presetOnly` field does not survive because the entire `nested` value is replaced.

> [!IMPORTANT]
> **Managed plugin precedence:** Layer 3 replaces Layer 2 for the same plugin, Layer 4 overlays the resolved runtime options, and the final shallow merge adds non-overridden preset defaults.
>
> None of these steps automatically clones arbitrary user-provided runtime objects. See [Instance Isolation](#instance-isolation) for the implications of shared references.

---

<a id="props-slots-priority"></a>

### 3.4. Props and Slots Priority

Component props and slots follow their own resolution rules, independently of the managed plugin configuration layers.

Values passed directly to `factory()` take precedence over the factory-level defaults.

For props:

```typescript
const factory = testComponentFactory(MyComponent, {
  title: "Default title",
});

factory({
  title: "Test title",
});
```

The test-level `props` override the factory's `defaultProps`. Similarly, the `slots` passed to `factory()` take precedence over `defaultSlots`.

---

<a id="execution-flags"></a>

## 4. 🎛️ Execution Flags

TestForge provides execution flags for adjusting configuration resolution and plugin initialization for an individual mount.

These flags are split between:

- `extraOptions` — the fourth argument of `factory()`
- selected execution options inside `mountOptions` — the second argument of `factory()`.

### 4.1. `extraOptions`

`extraOptions` is the fourth argument of `factory()`. It contains framework-level controls that affect configuration resolution and execution.

```typescript
factory(props, mountOptions, slots, extraOptions);
```

#### The `preset` Option

- **Type:** `keyof TestFrameworkPresets`

Selects a specific preset profile from the framework's preset registry for the current factory invocation.

```typescript
factory(
  {},
  {},
  {},
  {
    preset: "e2eLike",
  },
);
```

This allows a single factory to execute against a different registered runtime profile.

> [!NOTE]
> `extraOptions.preset` is relevant when the framework was created with `createTestFramework({ presets })`.
>
> When the framework is created with a single `preset`, that preset is the framework's default runtime environment and no runtime profile selection is required.

---

#### `skipDefaultProps`

- **Type:** `boolean`
- **Default:** `false`

When set to `true`, the factory ignores `defaultProps` defined when the factory was created.

```typescript
factory(
  {},
  {},
  {},
  {
    skipDefaultProps: true,
  },
);
```

Use this when a test needs to start without the factory-level default props.

---

#### `skipDefaultSlots`

- **Type:** `boolean`
- **Default:** `false`

When set to `true`, the factory ignores `defaultSlots` defined when the factory was created.

```typescript
factory(
  {},
  {},
  {},
  {
    skipDefaultSlots: true,
  },
);
```

---

#### `skipDefaultOptions`

- **Type:** `boolean`
- **Default:** `false`

When set to `true`, the factory ignores `defaultMountOptions` defined when the factory was created.

This allows a test to mount a component without inheriting factory-level mount options.

```typescript
factory(
  {},
  {},
  {},
  {
    skipDefaultOptions: true,
  },
);
```

> [!NOTE]
> `skipDefaultOptions` affects the factory-level `defaultMountOptions` layer. It does not remove preset defaults from the active preset.

---

### 4.2. `mountOptions`

Most properties in `mountOptions` are standard Vue Test Utils options.

TestForge also supports framework-specific execution flags in this argument.

#### `skipManagedPlugins`

- **Type:** `boolean`
- **Default:** `false`

When set to `true`, TestForge disables managed plugin orchestration for the current mount.

The test can then initialize plugins manually through Vue Test Utils `global.plugins`.

```typescript
const wrapper = factory(
  {},
  {
    skipManagedPlugins: true,
    global: {
      plugins: [customPiniaInstance],
    },
  },
);
```

This is useful when:

- the automatically created managed plugin instance does not match the test requirements
- a pre-created or mocked plugin instance must be used
- plugins need to be registered in a custom order
- the test requires non-standard plugin initialization.

> [!IMPORTANT]
> `skipManagedPlugins` disables TestForge's managed plugin orchestration for the current mount. It does not disable Vue Test Utils' own `global.plugins` mechanism.

---

<a id="managed-plugins"></a>

## 5. 🛠 Managed Plugins

Managed plugins are Vue integrations that participate in TestForge's plugin lifecycle.

Examples include:

- Pinia
- Vue Router
- Vue I18n
- Vuetify
- PrimeVue
- PrimeVue 3.

Unlike plugins registered directly through Vue Test Utils, managed plugins:

- are declared in the active preset manifest
- can be configured through TestForge's managed `plugins` API
- support managed plugin initialization and, where applicable, automatic instance creation
- support factory-level and test-level configuration
- support Layer 4 runtime overlays
- are validated against the active preset.

Each managed plugin package exports a stable identifier as `PLUGIN_NAME`.

Preset authors use the exported constant when declaring `defaults`, while runtime configuration normally uses the corresponding string key:

```typescript
defaults: {
  [PINIA_PLUGIN_NAME]: () => ({
    createSpy: vi.fn,
  }),
}
```

corresponds to:

```typescript
plugins: {
  pinia: {
    // Pinia-specific configuration
  },
}
```

The Pinia package exports `PLUGIN_NAME` as `"pinia"`, so runtime configuration uses `plugins.pinia`.

See [Getting Started → Managed Plugin Identifiers](./getting-started.md#managed-plugin-identifiers) for the canonical list of official TestForge plugin identifiers.

> [!IMPORTANT]
> The managed `plugins` object is not a general-purpose Vue plugin registry.
>
> Its keys must identify managed plugins declared in the active preset's `manifest`.

Conceptually:

```text
active preset manifest
        ↓
available managed plugin identifiers
        ↓
plugins: {
  pinia: ...,
  router: ...,
}
```

### 5.1. Preset Manifest Declaration

A managed plugin must be declared in the active preset manifest before it can be configured.

TestForge does not automatically discover or activate managed plugins.

For example, a project-owned Pinia preset can declare the plugin and its explicit configuration:

```typescript
import { vi } from "vitest";
import { createTestFramework } from "@testforgejs/vue-test-core";
import { piniaPlugin, PLUGIN_NAME as PINIA_PLUGIN_NAME } from "@testforgejs/vue-test-plugin-pinia";

const preset = {
  manifest: [
    {
      module: piniaPlugin,
      enabled: true,
    },
  ],
  defaults: {
    [PINIA_PLUGIN_NAME]: () => ({
      createSpy: vi.fn,
    }),
  },
};

const { testComponentFactory } = createTestFramework({
  preset,
});

export { testComponentFactory };
```

The same identifier appears in two forms:

```text
PINIA_PLUGIN_NAME
→ "pinia"
preset authoring
→ [PINIA_PLUGIN_NAME]
runtime configuration
→ plugins.pinia
```

Only after Pinia is declared in the active manifest can the managed `pinia` key be used across component factories and tests:

```typescript
const factory = testComponentFactory(MyComponent);

factory(
  {},
  {
    plugins: {
      pinia: {},
    },
  },
);
```

TestForge rejects configuration for plugins not declared in the active preset manifest.

Installing the package alone does not make it available in the active runtime profile.

For the architectural role of presets as runtime environment profiles
and plugin capability boundaries, see

[Presets as Runtime Environment Profiles](./architecture.md#presets-as-runtime-environment-profiles).

---

### 5.2. Preset Composition with `extendPreset()`

A project-owned preset does not need to extend an existing TestForge preset.
It can be defined independently with an explicit `PresetDefinition`, as shown in the previous section.
Use `extendPreset()` when you want to reuse an existing preset.

Preset extension is a **composition mechanism**, not another runtime configuration layer.
It creates a new complete preset from an existing preset plus explicit manifest or default-configuration changes.
It does not change the inheritance rules between runtime configuration layers.

Conceptually:

```text
direct project preset
→ independent explicit configuration
extendPreset(sourcePreset, ...)
→ reuse source preset
→ non-replaced configuration remains coupled to sourcePreset
```

#### Extending the Recommended Preset

For example, a project can reuse the composition of the recommended Vitest preset while taking explicit ownership of its Pinia configuration:

```typescript
import { vi } from "vitest";
import { extendPreset } from "@testforgejs/vue-test-core";
import { PLUGIN_NAME as PINIA_PLUGIN_NAME } from "@testforgejs/vue-test-plugin-pinia";
import { presets as recommendedPresets } from "@testforgejs/vue-test-preset-recommended";

const projectPreset = extendPreset(recommendedPresets.default, {
  defaults: {
    [PINIA_PLUGIN_NAME]: () => ({
      createSpy: vi.fn,
      stubActions: false,
    }),
  },
});
```

The extension replaces the Pinia default factory from the source preset.

The resulting project-owned configuration is visible directly in source:

```typescript
{
  createSpy: vi.fn,
  stubActions: false,
}
```

This is preferable when the project needs explicit Pinia defaults that remain stable even if the source preset changes.

The resulting preset can be used directly:

```typescript
const { testComponentFactory } = createTestFramework({
  preset: projectPreset,
});
```

#### Following a Source Preset Factory

A project can instead deliberately preserve and extend a source preset factory:

```typescript
const sourcePinia = recommendedPresets.default.defaults.pinia;

const projectPreset = extendPreset(recommendedPresets.default, {
  defaults: {
    [PINIA_PLUGIN_NAME]: () => ({
      ...sourcePinia(),
      stubActions: false,
    }),
  },
});
```

Since preset defaults are `PluginOptionsFactory` functions, call the source factory explicitly to reuse its returned options.

This has different ownership semantics:

```text
explicit materialized factory
→ project owns configuration
spread source preset factory
→ project intentionally follows source preset behavior
```

If a dependency update changes the source factory, it can also change the effective project configuration.

Use this form only when that coupling is intentional.

#### Manifest Extensions

An extension can also change which managed plugins are available.

For example, it can add a managed plugin:

```typescript
const extendedPreset = extendPreset(basePreset, {
  manifest: [
    {
      module: customPlugin,
      enabled: true,
    },
  ],
  defaults: {
    [CUSTOM_PLUGIN_NAME]: () => ({
      // Explicit plugin configuration
    }),
  },
});
```

An extension may also change the `enabled` state of a plugin already declared in the source manifest:

```typescript
const extendedPreset = extendPreset(basePreset, {
  manifest: [
    {
      module: routerPlugin,
      enabled: true,
    },
  ],
});
```

This changes the plugin's default activation state without requiring the entire source manifest to be redeclared.

`manifest` and `defaults` remain separate concerns:

```text
manifest
→ capability + default activation
defaults
→ baseline configuration
```

#### Plugin Default Replacement

Plugin defaults provided by an extension use **replacement semantics**, not deep merging.

If the source preset contains:

```typescript
defaults: {
  [PINIA_PLUGIN_NAME]: () => ({
    initialState: {
      user: {
        id: 1,
      },
    },
    stubActions: true,
  }),
}
```

and the extension provides:

```typescript
defaults: {
  [PINIA_PLUGIN_NAME]: () => ({
    createSpy: vi.fn,
  }),
}
```

the resulting preset uses:

```typescript
defaults: {
  [PINIA_PLUGIN_NAME]: () => ({
    createSpy: vi.fn,
  }),
}
```

The `initialState` and `stubActions` returned by the source factory are not automatically inherited.

This is intentional.

Once a project replaces a plugin factory, it does not implicitly inherit additional options from the source factory.

If following the source factory is intentional, invoke it explicitly as shown above.

> [!NOTE]
> `extendPreset()` replaces plugin default factories; it does not merge the objects returned by those factories.
>
> Spreading a source factory is an explicit decision to remain coupled to that source configuration.

#### Extension Validation

`extendPreset()` validates the extension before applying it.

The following rules apply:

- a new plugin added to `manifest` must explicitly define `enabled`
- `defaults` may only contain plugins declared in the resulting manifest
- plugin defaults must be `PluginOptionsFactory` functions that return valid plugin options
- `false` is not allowed in preset defaults
- to disable a plugin by default, use `enabled: false` in the manifest
- duplicate plugin entries inside the extension manifest are rejected.

If a newly added plugin requires baseline configuration, provide its factory explicitly:

```typescript
extendPreset(basePreset, {
  manifest: [
    {
      module: customPlugin,
      enabled: true,
    },
  ],
  defaults: {
    [CUSTOM_PLUGIN_NAME]: () => ({
      // Explicit plugin configuration
    }),
  },
});
```

> [!IMPORTANT]
> `extendPreset()` is intended for **preset composition**, not runtime plugin configuration.
>
> Use it when reuse of another preset is intentional.
>
> Use a direct project-owned `PresetDefinition` when you want independent explicit project configuration.
>
> Use `mountOptions.plugins` or `extraOptions.plugins` when changing plugin configuration for an individual test.

---

### 5.3. Configuration Validation

TestForge validates managed plugin configuration against the active preset.

#### Manifest Binding

Plugin keys at the following configuration points must refer to plugins declared in the active preset manifest:

- preset `defaults`
- `defaultMountOptions.plugins`
- `mountOptions.plugins`
- `extraOptions.plugins`.

For example, if the manifest contains:

```typescript
manifest: [
  {
    module: piniaPlugin,
    enabled: true,
  },
];
```

the following configuration is valid:

```typescript
{
  plugins: {
    pinia: {},
  },
}
```

Any unknown plugin key is rejected.

The manifest defines which managed plugins can be configured.

#### Plugin Configuration Values

Runtime managed plugin configuration values at `defaultMountOptions.plugins`, `mountOptions.plugins`, and `extraOptions.plugins` can be:

- an options object, optionally including `withPluginInstance()` metadata
- `false`, to explicitly disable the plugin for the current mount.

In `extraOptions.plugins`, an object shallow-overlays the previous runtime configuration; `false` overrides it completely and disables the managed plugin.

For example:

```typescript
factory(
  {},
  {
    plugins: {
      router: false,
    },
  },
);
```

Preset defaults follow a different rule: they are `PluginOptionsFactory` functions and cannot use `false`.

To make a managed plugin available but disabled by default, use `enabled: false` in the preset manifest and activate it through runtime configuration when needed.

#### Instance Capture in Factory Defaults

`captureInstance<T>()` must be configured **per mount**, through `mountOptions.plugins` or `extraOptions.plugins`. Do not spread a capture object into `defaultMountOptions.plugins`: factory defaults are reused across mounts, and subsequent captures would overwrite the reference held by earlier tests.

TestForge rejects an instance-capture callback in `defaultMountOptions.plugins.<name>` at runtime, **even if** the plugin configuration is replaced by `mountOptions.plugins.<name>` or factory defaults are skipped using `skipDefaultOptions`.

```typescript
const capture = captureInstance<TestingPinia>();

const factory = testComponentFactory(
  MyComponent,
  {},
  {
    plugins: {
      pinia: { ...capture }, // Invalid: capture belongs to factory defaults.
    },
  },
);

factory(); // Throws: Instance capture is not allowed in defaultMountOptions.plugins.pinia.
```

Instead, create a capture object for the individual mount:

```typescript
const factory = testComponentFactory(MyComponent);
const capture = captureInstance<TestingPinia>();

factory({}, { plugins: { pinia: { ...capture } } }); // Valid.
```

Using one capture object across several `factory()` invocations is also discouraged: its `instance` getter points to the instance captured most recently. See [Accessing Plugin Instances](#accessing-plugin-instances) for guidance.

#### Unmanaged Third-Party Plugins

Plugins that are not registered as TestForge-managed integrations must not be passed through the managed `plugins` object.

Use standard Vue Test Utils configuration instead:

```typescript
factory(
  {},
  {
    global: {
      plugins: [thirdPartyPlugin],
    },
  },
);
```

This separates TestForge-managed plugin configuration from direct Vue Test Utils registration.
Managed plugins participate in TestForge's preset, validation, and lifecycle pipeline.
Manually registered plugins bypass that pipeline and are passed directly to Vue Test Utils.

---

### 5.4. Practical Examples

A plugin declared in the preset manifest can be enabled or disabled for individual tests.

#### Disabling a Managed Plugin Completely

Pass `false` through `mountOptions.plugins` to disable a managed integration for a specific test:

```typescript
factory(
  {},
  {
    plugins: {
      router: false,
    },
  },
);
```

This disables the managed Router pipeline for the current mount.

You can also disable Router through `extraOptions.plugins`, even if the factory or the current mount would otherwise enable it:

```typescript
factory(
  {},
  {},
  {},
  {
    plugins: {
      router: false,
    },
  },
);
```

The Layer 4 `false` has the highest runtime precedence for that plugin. It prevents both managed instance creation (or reuse of a supplied instance) and the final merge of its preset defaults.

This can be useful when the test does not need Router or when the test intends to take manual control over the environment.

#### Enabling a Plugin Disabled by Default

If a plugin is declared with `enabled: false` in the active preset manifest, pass an empty options object to enable it for an individual test:

```typescript
factory(
  {},
  {
    plugins: {
      router: {},
    },
  },
);
```

This makes the integration available without activating it for every component test.

---

<a id="third-party-plugins"></a>

## 6. 🔌 Third-Party Plugins

TestForge-managed plugins participate in the configuration and preset lifecycle pipeline.

Vue plugins that are not managed by TestForge can be registered using standard Vue Test Utils options inside the `global` section.

For example:

```typescript
import ThirdPartyPlugin from "third-party-plugin";

const factory = testComponentFactory(MyComponent);
const wrapper = factory(
  {},
  {
    global: {
      plugins: [ThirdPartyPlugin],
    },
  },
);
```

Plugins registered through `global.plugins` bypass TestForge's managed plugin pipeline.

### Managed vs. Manually Registered Plugins

| Configuration Key | Allowed Plugins                                                       | Pipeline Integration                                                  |
| :---------------- | :-------------------------------------------------------------------- | :-------------------------------------------------------------------- |
| `plugins`         | **Managed only** — identifiers declared in the active preset manifest | Participates in presets, validation, lifecycle handling, and overlays |
| `global.plugins`  | **Manually registered Vue plugins**                                   | Bypasses TestForge and is passed directly to Vue Test Utils           |

This table intentionally does not duplicate the list of official managed plugin identifiers.

See [Getting Started → Managed Plugin Identifiers](./getting-started.md#managed-plugin-identifiers) for the canonical list.

### When to Use `global.plugins`

Use the standard Vue Test Utils array when:

- the Vue plugin is not supported or managed by TestForge
- the test requires a custom, manually pre-instantiated plugin
- you need to bypass TestForge's managed lifecycle pipeline for a specific dependency.

> [!TIP]
> If you need to work directly with underlying instances of managed plugins such as Pinia or Router, see [Advanced: Working with Plugin Instances](#plugin-instances).

---

<a id="plugin-instances"></a>

## 7. 🛡 Advanced: Working with Plugin Instances

You usually do not need to interact directly with plugin instances.

Direct access is useful when asserting the state of **Pinia**, **Vue Router**, or **Vue I18n** after a component action. The same section also explains how one managed plugin can depend on another plugin's instance.

<a id="precreated-plugin-instances"></a>

### 7.1. Using Pre-created Instances (`withPluginInstance()`)

Some tests need a **pre-created** plugin instance, such as a Pinia instance configured with `@pinia/testing` or a fully configured Router, rather than a new instance created by TestForge.

Use `withPluginInstance(instance)` to supply that instance to a managed plugin. **It is supported in all three runtime configuration layers:** `defaultMountOptions.plugins`, `mountOptions.plugins`, and `extraOptions.plugins`. Spread its result into the configuration for the relevant managed plugin.

For example, an individual mount can supply a prepared Pinia instance through `extraOptions.plugins`:

```typescript
import { createTestingPinia } from "@pinia/testing";
import { withPluginInstance } from "@testforgejs/vue-test-core";

const preparedPinia = createTestingPinia();
const factory = testComponentFactory(MyComponent);

factory(
  {},
  {},
  {},
  {
    plugins: {
      pinia: {
        ...withPluginInstance(preparedPinia),
      },
    },
  },
);
```

#### Choosing a Configuration Layer

**Factory-level shared instance — `defaultMountOptions.plugins`**

```typescript
const sharedPinia = createTestingPinia();

const factory = testComponentFactory(
  MyComponent,
  {},
  {
    plugins: {
      pinia: {
        ...withPluginInstance(sharedPinia),
      },
    },
  },
);

factory();
factory(); // Both mounts reuse sharedPinia.
```

Use this when sharing the same prepared instance is intentional. TestForge preserves its identity and state; it does **not** reset the instance between mounts. For independent tests, prefer creating a fresh instance per test.

**Mount-specific instance — `mountOptions.plugins`**

```typescript
const preparedPinia = createTestingPinia();

factory(
  {},
  {
    plugins: {
      pinia: {
        ...withPluginInstance(preparedPinia),
      },
    },
  },
);
```

This replaces the entire factory-level `pinia` configuration for this mount. If the factory defined another pre-created Pinia instance, it is **not** inherited. Likewise, providing ordinary `pinia` options here without `withPluginInstance()` replaces the factory-level pre-created instance and uses normal managed creation.

**Targeted override — `extraOptions.plugins`**

As shown above, the fourth argument shallow-overlays the effective runtime plugin configuration. Its `withPluginInstance()` metadata overrides any instance supplied by `defaultMountOptions` or `mountOptions`, while unrelated runtime options are preserved.

An explicit `false` in `extraOptions.plugins.<name>` instead disables the managed plugin entirely, including any previously supplied instance:

```typescript
factory(
  {},
  {},
  {},
  {
    plugins: {
      pinia: false,
    },
  },
);
```

**Precedence summary:** Layer 3 replaces Layer 2 for the same plugin; Layer 4 overlays the result or disables it with `false`; non-overridden preset defaults are merged only for enabled plugins. TestForge then extracts `withPluginInstance()` metadata from the final enabled configuration.

> [!IMPORTANT]
> `withPluginInstance()` is allowed in factory defaults, but `captureInstance()` is **not**. Instance capture must be configured separately for each mount through `mountOptions.plugins` or `extraOptions.plugins`.

**When `withPluginInstance()` is used:**

- TestForge reuses the exact supplied instance rather than constructing a new one.
- The managed plugin remains in the TestForge pipeline, including instance capture and dependency resolution where supported.
- The supplied instance is installed into the component's Vue Test Utils mounting environment.

`withPluginInstance()` adds **symbol-keyed TestForge metadata**, avoiding conflicts with native plugin option names. The former string-keyed `__meta.instance` syntax is no longer supported as a TestForge control option.

> [!IMPORTANT]
> **Configure the instance before passing it to TestForge.**
>
> Options used solely to **create** a plugin instance do not reconfigure an existing instance. For example, specifying `router.routes` alongside `withPluginInstance(existingRouter)` does not add routes to `existingRouter`; configure the router with those routes when creating it (or update it through its own API).
>
> TestForge may still retain other plugin configuration for managed integration behavior, so do not assume that _every_ accompanying option is discarded.

> [!WARNING]
> **Shared instances and test isolation**
>
> `withPluginInstance()` preserves the supplied instance's identity and state. If you reuse that same instance across independent tests, mutations in one test can affect later tests and introduce order-dependent failures.
>
> For independent tests, prefer instances created by TestForge or create a **fresh pre-configured instance for each test**. Share an instance across mounts only when shared state is intentional.

#### Why use `withPluginInstance()` instead of `global.plugins`?

`withPluginInstance()` tells TestForge to reuse an existing instance **within its managed plugin pipeline**, rather than bypassing that pipeline. This lets TestForge coordinate it with other managed plugins, resolve supported instance dependencies, and expose it through `captureInstance()`.

> [!NOTE]
> **Choosing between `withPluginInstance()` and `skipManagedPlugins`:**
>
> - Use `withPluginInstance()` to supply an instance for **one managed plugin** while TestForge continues orchestrating the other managed plugins in the active preset.
> - Use `skipManagedPlugins: true` to **opt out of the managed plugin pipeline** for the current mount and configure plugins manually through Vue Test Utils.

#### When to use `withPluginInstance()`

- **State sharing** — share the exact same instance across helpers or mounts when that is intentional.
- **Complex preparation** — build or configure an instance before mounting a component.

Pre-created instances are especially useful for stateful integrations such as **Pinia** and **Vue Router**. See [Accessing Plugin Instances](#accessing-plugin-instances) to capture the reused instance, and [Plugin Instance Dependencies](#plugin-instance-dependencies) to reference it from another managed plugin.

---

<a id="accessing-plugin-instances"></a>

### 7.2. Accessing Plugin Instances

Some tests need direct access to a managed plugin instance to inspect its runtime state or invoke its API. Use **`captureInstance<T>()`**, the supported TestForge mechanism for accessing instances created or reused by the managed plugin pipeline.

#### Capturing an Instance with `captureInstance()`

Create a capture object, spread it into the managed plugin's configuration, and read its `instance` property after calling the component factory:

```typescript
import { captureInstance } from "@testforgejs/vue-test-core";
import type { TestingPinia } from "@pinia/testing";

const factory = testComponentFactory(MyComponent);

const piniaCapture = captureInstance<TestingPinia>();
const wrapper = factory(
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
if (!piniaCapture.instance) {
  throw new Error("Expected the Pinia instance to be captured");
}
expect(typeof piniaCapture.instance.install).toBe("function");
```

The capture receives the **same instance** used for the component mount. The instance is available after `factory()` returns, because the managed plugin is created or reused before Vue Test Utils mounts the component. You can use it for assertions or for manipulating plugin state.

> [!TIP]
> **TypeScript:** Pass the expected instance type explicitly, for example `captureInstance<TestingPinia>()`, `captureInstance<Router>()`, or `captureInstance<I18n>()`. The `instance` property is typed as `T | undefined` until you narrow it. Calling `captureInstance()` without a type argument defaults to `unknown`; spreading its result into a plugin's options does **not** retroactively infer the generic type from that plugin's name.

#### How Capturing Works

`captureInstance()` exposes an **internal, symbol-keyed callback** when its result is spread into plugin options. Its public `instance` getter is non-enumerable, so it is not copied by the object spread. TestForge invokes the callback with the created or reused instance and **excludes the internal callback from the options passed to the underlying native plugin factory**.

The former string-keyed `expose` callback is **not a TestForge instance-capture API**. Do not use `plugins.<name>.expose` to capture a managed plugin instance. An `expose` option belonging to an underlying plugin, if any, remains an ordinary native plugin option; TestForge does not invoke it as a capture callback.

#### Configuration Layers and Multiple Mounts

**Use a new capture object for each component mount.** Pass it through `mountOptions.plugins` or `extraOptions.plugins` when calling `factory()`. These are per-mount configuration layers.

**Do not pass `captureInstance()` through `defaultMountOptions.plugins`.** TestForge rejects it at runtime, including when `mountOptions.plugins.<name>` replaces that plugin's default configuration. Factory defaults are shared across mounts, whereas an instance capture must belong to a particular mount. See [Configuration Validation](#53-configuration-validation).

A capture supplied through `mountOptions.plugins.<name>` can be combined with per-mount overrides from `extraOptions.plugins.<name>`. Remember that `mountOptions.plugins.<name>` **replaces** the `defaultMountOptions.plugins.<name>` configuration, while `extraOptions.plugins.<name>` applies a shallow overlay. See [Managed Plugin Configuration](#managed-plugin-configuration).

For **independent captures across mounts**, create a new capture object for each mount:

```typescript
const firstCapture = captureInstance<TestingPinia>();
const secondCapture = captureInstance<TestingPinia>();

factory({}, { plugins: { pinia: { ...firstCapture } } });
factory({}, { plugins: { pinia: { ...secondCapture } } });

expect(firstCapture.instance).toBeDefined();
expect(secondCapture.instance).toBeDefined();
expect(firstCapture.instance).not.toBe(secondCapture.instance);
```

Reusing the **same capture object** across mounts is incorrect usage: each capture callback updates the same `instance` property, so a subsequent mount can replace the reference before an earlier test reads it. In concurrent tests, this can cause tests to inspect another mount's instance. Create a fresh capture for each mount; if you need a stable reference, save `capture.instance` to a local variable immediately after mounting.

To reuse a **pre-created** instance, provide it through [`withPluginInstance()`](#precreated-plugin-instances); it can also be captured with `captureInstance()` configured for that mount. For more on instance lifetime and explicitly shared objects, see [Instance Isolation](#instance-isolation).

---

<a id="plugin-instance-dependencies"></a>

### 7.3. Plugin Instance Dependencies

Some managed plugins need access to an instance created by another managed plugin. For example, Vuetify can use the Vue I18n instance created for the same component mount to configure its locale adapter.

Use `fromPluginInstance()` to declare this relationship in a managed plugin's options. TestForge resolves the reference **at mount time**, creates dependencies before their consumers, and passes the resolved value to the consuming plugin. You do not need to create a second instance or depend on the order of entries in the preset manifest.

#### Declaring a Dependency with `fromPluginInstance()`

```typescript
fromPluginInstance(pluginName, (instance) => value);
```

- `pluginName` identifies the managed plugin that provides the instance.
- The resolver receives that plugin's instance and returns either the instance itself or a value derived from it.
- `fromPluginInstance()` creates a deferred reference. The resolver is **not** executed when the configuration is declared.

Use the referenced plugin package's `PLUGIN_NAME` export where available. The resolver's instance type is inferred from the plugin's registered instance type when TypeScript metadata is provided by the integration.

**Example: Sharing Vue I18n with Vuetify**

```typescript
import { fromPluginInstance } from "@testforgejs/vue-test-core";
import { PLUGIN_NAME as I18N_PLUGIN_NAME } from "@testforgejs/vue-test-plugin-i18n";
import { useI18n } from "vue-i18n";
import { createVueI18nAdapter } from "vuetify/locale/adapters/vue-i18n";

const factory = testComponentFactory(
  MyComponent,
  {},
  {
    plugins: {
      i18n: {
        legacy: false,
      },
      vuetify: {
        locale: {
          adapter: fromPluginInstance(I18N_PLUGIN_NAME, (i18n) =>
            createVueI18nAdapter({ i18n, useI18n }),
          ),
        },
      },
    },
  },
);

factory();
```

The resolver receives the Vue I18n instance created by TestForge for the current mount.

`createVueI18nAdapter()` expects the complete I18n instance, not its `global` Composer. The adapter accesses `i18n.global` internally.

This allows Vuetify to use the same Vue I18n instance as the mounted component without creating or sharing a separate instance.

This example assumes that both integrations are declared in the active preset manifest and that the Vue I18n integration supports instance references. TestForge creates the managed Vue I18n instance first, resolves the Vuetify adapter from **that same instance**, and then creates Vuetify. The reference does not create another Vue I18n instance.

You can declare references in preset defaults, `defaultMountOptions.plugins`, `mountOptions.plugins`, or `extraOptions.plugins`. References may also appear inside nested plain objects and arrays in plugin options. TestForge does not recursively inspect arbitrary class instances or other non-plain runtime objects.

#### Resolution Order and Lifecycle

TestForge determines dependencies from the **effective plugin configuration**, after applying the rules described in [Managed Plugin Configuration](#managed-plugin-configuration): Layer 3 replaces Layer 2 for the same plugin, Layer 4 applies its overlay, and preset defaults provide the base for the final shallow merge.

For each mount, TestForge then:

1. Discovers instance references in the effective managed plugin options and validates the dependency graph.
2. Creates provider plugins before consumers, even if a consumer appears earlier in the preset manifest. Transitive dependencies are handled in the same way.
3. Resolves a consumer's references using instances created for the current mount.
4. Invokes the consumer's `beforeCreate` hook with **resolved options**, then creates the consumer instance and invokes `afterCreate`.

A provider's `afterCreate` hook runs before a dependent consumer's `beforeCreate` hook. Both plugin creation and installation follow the resolved dependency order.

> [!NOTE]
> References are resolved **only if they survive configuration layering**. A reference replaced by Layer 3 or overridden by Layer 4 is not evaluated. This also means a discarded reference does not create a dependency on its former provider.

#### Supported Providers and Validation

The referenced plugin must be part of the active preset manifest, active for the current mount, and implemented with instance-reference support. Plugin authors opt in by setting `supportsInstanceReferences: true` in the **provider's** plugin definition; the consuming plugin does not need this flag merely to use a reference.

TestForge rejects invalid dependency graphs, including:

- a reference to a disabled or unavailable provider
- a reference to a plugin that does not support instance references
- circular dependencies between managed plugins.

These dependency errors are detected before plugin instances are created or the component is mounted. A provider declared with `enabled: false` in the preset can still participate once it has been activated through supported runtime plugin configuration.

> [!WARNING]

> Do **not** pass `fromPluginInstance()` to `withPluginInstance()`. The latter requires a **pre-created instance**, not a deferred dependency reference. See [Using Pre-created Instances](#precreated-plugin-instances).

#### Pre-created Instances and Mount Isolation

A provider supplied through `withPluginInstance()` in `defaultMountOptions.plugins.<name>`, `mountOptions.plugins.<name>`, or `extraOptions.plugins.<name>` can also satisfy a dependency. The resolver receives the **effective supplied instance** after runtime configuration precedence is applied; TestForge does not recreate it.

References are evaluated separately for every mount. Normally, each mount resolves to its own TestForge-created provider instance; when a pre-created provider is intentionally shared, each mount's resolver receives that shared instance instead.

References stored in reusable factory defaults remain as references: resolving a nested value for one mount does **not** overwrite the source configuration or cause later mounts to reuse the previous mount's resolved instance.

TestForge creates new configuration containers where needed to resolve references, but preserves the identity of unrelated user-provided runtime objects. See [Instance Isolation](#instance-isolation) for the distinction between framework-managed instances and explicitly shared objects.

---

<a id="instance-isolation"></a>

### 7.4. Instance Isolation

By default, each factory invocation creates a separate runtime environment.

Managed plugin instances created by TestForge for one mount are not automatically shared with another mount. Plugin dependency references are also resolved independently for each invocation.

However, this isolation does not extend to arbitrary objects provided by the user. TestForge preserves their identity and does not automatically clone or recreate them.

As a result, user-provided objects may share state across mounts if the same references are reused.

For example:

```typescript
const firstCapture = captureInstance<Pinia>();
const secondCapture = captureInstance<Pinia>();

const factory = testComponentFactory(MyComponent);

const first = factory(
  {},
  {},
  {},
  {
    plugins: {
      pinia: {
        ...firstCapture,
      },
    },
  },
);

const second = factory(
  {},
  {},
  {},
  {
    plugins: {
      pinia: {
        ...secondCapture,
      },
    },
  },
);

expect(firstCapture.instance).not.toBe(secondCapture.instance);
```

To share a plugin instance across mounts or helpers, provide a pre-created instance rather than relying on automatic creation.
Pass the instance through `withPluginInstance()` in factory defaults or per-mount options as described in [Section 7.1](#precreated-plugin-instances).
TestForge reuses it without changing its identity or resetting its state.
An instance placed in `defaultMountOptions.plugins` is therefore shared by every mount that does not override or disable that plugin.

TestForge's isolation guarantees apply to plugin instances created independently for each mount, not to explicitly reused instances.
When multiple mounts use the same instance through `withPluginInstance()`, they may share mutable runtime state.
Changes made by one test may persist into another unless the instance is recreated or its state is explicitly reset.
Explicit instance reuse should therefore be reserved for scenarios where shared state is intentional.

#### User-Provided Objects and Reference Sharing

TestForge does not automatically clone or recreate objects provided in `defaultMountOptions`.

Because `defaultMountOptions` is defined once when a component factory is created, object references supplied at this level may be reused across multiple mounts. The exception is instance capture: `captureInstance()` must not be included in `defaultMountOptions.plugins` and is rejected by runtime validation. Configure it for each mount instead.

This is especially important for stateful objects, such as:

- Vue Router history instances
- pre-created Vue plugin instances
- services and adapters with internal state
- objects shared between multiple plugins.

TestForge preserves these references because cloning arbitrary runtime objects could break their internal state, closures, or relationships with other plugins.

#### Example: Shared Router History

Consider a component factory configured with a custom Router history:

```typescript
import { createMemoryHistory } from "vue-router";

const customHistory = createMemoryHistory();
const factory = testComponentFactory(
  MyComponent,
  {},
  {
    plugins: {
      router: {
        history: customHistory,
      },
    },
  },
);
```

Every invocation of `factory()` receives the same `customHistory` reference unless the Router configuration is overridden.

```typescript
const first = factory();
const second = factory();
```

Although TestForge creates a new managed Router instance for each mount, both instances receive the same history object.

Changes to its internal state may therefore affect subsequent tests.

This is intentional: TestForge does not clone or reset user-provided objects.

#### Example: Creating a Fresh History for Each Mount

When each test requires an independent history instance, provide it through test-level `mountOptions`:

```typescript
const factory = testComponentFactory(MyComponent);

const first = factory(
  {},
  {
    plugins: {
      router: {
        history: createMemoryHistory(),
      },
    },
  },
);

const second = factory(
  {},
  {
    plugins: {
      router: {
        history: createMemoryHistory(),
      },
    },
  },
);
```

Each call to `createMemoryHistory()` creates a distinct history instance.

For repeated setup, a small test helper can avoid duplication:

```typescript
const mountWithHistory = () =>
  factory(
    {},
    {
      plugins: {
        router: {
          history: createMemoryHistory(),
        },
      },
    },
  );

const first = mountWithHistory();
const second = mountWithHistory();
```

If the Router integration's default history is sufficient, there is no need to provide a custom history. The integration creates its default history separately for each Router instance.

> [!IMPORTANT]
> **Object identity and test isolation**
>
> Objects supplied through `defaultMountOptions` may be shared across mounts. TestForge preserves user-provided runtime object references and does not automatically clone, recreate, or reset them.
>
> To obtain mount-specific instances, create fresh objects in `mountOptions` or rely on plugin integrations that create them automatically.
>
> TestForge isolates its own runtime state, but the lifecycle of explicitly supplied objects remains under the user's control.

---

**Back to:** [Project README](../README.md)
