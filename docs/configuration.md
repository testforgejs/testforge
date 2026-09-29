# ⚙️ Configuration & Advanced Usage

This guide explains TestForge's configuration model and advanced runtime controls.

It covers:

- the `testComponentFactory` API;
- the four-tier configuration layering model;
- merge strategies for Vue Test Utils and managed plugin options;
- execution controls and runtime overlays;
- managed plugin configuration and validation;
- preset composition;
- third-party Vue Test Utils plugins;
- advanced plugin instance handling.

If you are new to TestForge, start with the [Getting Started Guide](getting-started.md).

## Table of Contents

- [1. `testComponentFactory` Signature](#testcomponentfactory-signature)
- [2. The 4-Tier Configuration Layering Model](#configuration-layers)
- [3. Merge Strategies](#merge-strategies)
  - [3.1. Flat Vue Test Utils Options](#flat-vtu-options)
  - [3.2. The `global` Section](#global-options)
  - [3.3. Managed Plugin Configuration](#managed-plugin-configuration)
  - [3.4. Props & Slots Priority](#props-slots-priority)
- [4. Execution Flags](#execution-flags)
- [5. Managed Plugins](#managed-plugins)
  - [5.1. Preset Manifest Declaration](#51-preset-manifest-declaration)
  - [5.2. Preset Composition with `extendPreset()`](#52-preset-composition-with-extendpreset)
  - [5.3. Configuration Validation](#53-configuration-validation)
  - [5.4. Practical Examples](#54-practical-examples)
- [6. Third-Party Plugins](#third-party-plugins)
- [7. Advanced: Working with Plugin Instances](#plugin-instances)
  - [7.1. Using Pre-created Instances (`__meta.instance`)](#precreated-plugin-instances)
  - [7.2. Accessing Plugin Instances](#accessing-plugin-instances)
  - [7.3. Instance Isolation](#instance-isolation)

<a id="testcomponentfactory-signature"></a>

## 1. 📝 `testComponentFactory` Signature

`testComponentFactory` creates a reusable factory for mounting a specific component.

You can define common props, slots, Vue Test Utils options, and plugin configuration once and override them for individual tests.

### Factory Creation

```typescript
const factory = testComponentFactory(
  Component,
  defaultProps?,
  defaultMountOptions?,
  defaultSlots?,
);
```

The arguments are applied as factory-level defaults for every invocation of the resulting factory.

- `Component` — the Vue component to mount.
- `defaultProps` — default component props.
- `defaultMountOptions` — default Vue Test Utils mounting options and managed plugin configuration.
- `defaultSlots` — default component slots.

### Factory Execution

```typescript
const wrapper = factory(
  props?,
  mountOptions?,
  slots?,
  extraOptions?,
);
```

The arguments configure an individual component mount.

- `props` — test-specific component props.
- `mountOptions` — test-specific Vue Test Utils options and managed plugin configuration.
- `slots` — test-specific component slots.
- `extraOptions` — advanced framework controls and runtime plugin overlays.

The exact resolution and merge behavior of these arguments is described in the following sections.

---

<a id="configuration-layers"></a>

## 2. 🥞 The 4-Tier Configuration Layering Model

TestForge resolves configuration across four distinct layers.

Each layer represents a different configuration scope and is designed for a different purpose.

| Layer                               | Defined At               | Scope                  | Managed Plugin Behavior                       |
| :---------------------------------- | :----------------------- | :--------------------- | :-------------------------------------------- |
| **Layer 1: Preset Defaults**        | `createTestFramework()`  | Project-wide baseline  | Baseline configuration                        |
| **Layer 2: `defaultMountOptions`**  | `testComponentFactory()` | Factory-level baseline | Full replacement of the plugin configuration  |
| **Layer 3: `mountOptions`**         | `factory()`              | Individual test        | Full replacement of the plugin configuration  |
| **Layer 4: `extraOptions.plugins`** | `factory()` 4th argument | Individual test        | Shallow overlay on the resolved configuration |

### Layer 1: Preset Defaults

Preset defaults provide the baseline configuration for managed plugins in the active runtime environment.

Each default is defined as a `PluginOptionsFactory`. TestForge invokes the factory when resolving the active preset configuration.

For example, a project-owned Pinia preset can materialize its Vitest configuration explicitly:

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

Using a factory ensures that plugin options are created for the current pipeline context rather than shared as one mutable configuration object.

For example:

```typescript
const defaultPinia = () => ({
  initialState: {},
  stubActions: true,
});

const first = defaultPinia();
const second = defaultPinia();

first !== second; // true
```

This is particularly important for plugins with nested or mutable configuration such as Pinia state, Vue Router routes and history configuration, and Vue I18n messages.

Managed plugins must be declared in the active preset manifest before they can be configured through TestForge's managed `plugins` API.

Preset composition is a separate concern and is described later in [Section 5.2](#52-preset-composition-with-extendpreset).

---

### Layer 2: `defaultMountOptions`

Factory-level defaults are defined when creating a component factory.

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

This configuration becomes the baseline for all tests created from this factory.

For managed plugins, a plugin configuration provided at this layer replaces the corresponding configuration inherited from the preset.

---

### Layer 3: `mountOptions`

Test-level configuration is provided when invoking the factory.

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

For managed plugins, a plugin configuration provided here replaces the corresponding factory-level configuration.

This replacement behavior prevents test-specific state from accidentally inheriting unrelated state from the factory configuration.

---

### Layer 4: `extraOptions.plugins`

The fourth layer provides a fine-grained overlay for managed plugin configuration.

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

Unlike `mountOptions.plugins`, `extraOptions.plugins` does not replace the already resolved plugin configuration.

Instead, it applies a shallow overlay to the resolved configuration.

For example, if previous layers established:

```typescript
{
  initialState: {
    user: { id: 1 },
  },
  stubActions: true,
}
```

the Layer 4 overlay:

```typescript
{
  stubActions: false,
}
```

produces an effective configuration equivalent to:

```typescript
{
  initialState: {
    user: { id: 1 },
  },
  stubActions: false,
}
```

The inherited `initialState` is preserved.

> [!NOTE]
> Use `mountOptions.plugins` when you want to replace the managed plugin configuration for a test.
>
> Use `extraOptions.plugins` when you want to adjust specific properties without redeclaring the entire configuration.

---

<a id="merge-strategies"></a>

## 3. 🔄 Merge Strategies

Not all configuration is merged in the same way.

TestForge uses different strategies depending on the type of configuration being resolved.

<a id="flat-vtu-options"></a>

### 3.1. Flat Vue Test Utils Options

Standard flat Vue Test Utils options are resolved between factory-level `defaultMountOptions` and test-level `mountOptions`.

These options are merged using a shallow merge strategy.

When the same option is provided at both the factory level (`defaultMountOptions`) and the test level (`mountOptions`), the test-level value takes precedence.

Examples include:

- `data`;
- `attrs`;
- `attachTo`;
- `shallow`;
- other top-level VTU mount options that are represented as flat values.

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

The effective configuration keeps `attachTo` from the factory defaults while the test-level `shallow` value overrides the factory value.

#### The `shallow` Option

`shallow` controls whether the component is mounted using `mount()` or `shallowMount()`.

The framework also provides a global `shallowByDefault` option:

```typescript
import { createTestFramework } from "@testforgejs/vue-test-core";
import { presets } from "@testforgejs/vue-test-preset-recommended";

export const { testComponentFactory } = createTestFramework({
  preset: presets.default,
  shallowByDefault: true,
});
```

When `shallowByDefault` is enabled, factories use shallow mounting unless a more specific `shallow` value is provided.

The resolution order is:

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

// Uses shallowMount() because the test-level option overrides the factory default.
factory(
  {},
  {
    shallow: true,
  },
);
```

The most specific configuration wins.

> [!NOTE]
> This section covers flat VTU mount options. The `global` object and managed plugin configurations follow separate resolution rules and are described in the following sections.

---

<a id="global-options"></a>

### 3.2. The `global` Section

Standard VTU `global` options (`stubs`, `mocks`, `provide`) are processed using a **selective recursive merge** strategy across Layer 2 and Layer 3.

This allows test-double infrastructure to be layered without removing unrelated factory-level configuration.

#### Key Merge Rules

- **Objects** — merged recursively only on intersecting keys. Non-intersecting objects retain their original references; they are not deep-cloned.
- **Arrays** — combined into a unique set using union merge with deduplication.
- **Primitives** — test-level values overwrite factory-level values.

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
      $store: {},
    },
  },
}
```

This behavior is useful when a factory defines shared test infrastructure and individual tests need to add or override only part of that infrastructure.

> [!NOTE]
> The `global` section follows its own recursive merge rules. It should not be confused with managed plugin configuration, which intentionally uses replacement semantics at Layers 2 and 3.

---

<a id="managed-plugin-configuration"></a>

### 3.3. Managed Plugin Configuration

Managed plugin configuration uses different rules from standard Vue Test Utils options.

Managed plugins control plugin-specific configuration such as:

- Pinia `initialState`;
- Vue I18n `messages` and `locale`;
- Vue Router `routes`;
- plugin-specific options for Vuetify, PrimeVue, PrimeVue 3, and other supported integrations.

Because these options can represent application state, blindly deep-merging them can produce unexpected test behavior.

#### Layers 2 and 3: Full Replacement

When a managed plugin is configured through `defaultMountOptions.plugins` or `mountOptions.plugins`, the plugin configuration replaces the corresponding configuration from the previous layer.

> [!NOTE]
> Plugin replacement occurs at the configuration object level, not per property.
>
> Consequently, fields such as `expose`, `captureInstance`, and `__meta` are discarded when a plugin configuration is overridden in Layer 3. If they should remain active, they must be included in the overriding configuration.

For example, suppose the factory has:

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

A test can explicitly provide a different state:

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

The test-level configuration is not deep-merged with the factory-level `initialState`.

The resulting Pinia configuration uses the test-level state:

```typescript
{
  initialState: {
    users: [],
  },
}
```

This prevents stale or unrelated test data from leaking into another test.

#### Layer 4: Shallow Overlay

`extraOptions.plugins` is intended for precise local adjustments.

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

The overlay is applied to the already resolved managed plugin configuration.

For example, if the previous layers provide:

```typescript
{
  initialState: {
    users: [{ id: 1 }],
  },
  stubActions: false,
}
```

the Layer 4 overlay:

```typescript
{
  stubActions: true,
}
```

preserves the existing state while changing only the action-stubbing option.

> [!IMPORTANT]
> Layers 2 and 3 intentionally use replacement semantics for managed plugin configuration.
>
> This prevents test data pollution and makes test-specific state explicit.
>
> Use Layer 4 when you need to patch an already resolved configuration without replacing it.

---

<a id="props-slots-priority"></a>

### 3.4. Props & Slots Priority

Component props and slots follow a separate resolution model.

Direct `props` and `slots` arguments passed to `factory()` represent the immediate intent of the individual test.

For props:

```typescript
const factory = testComponentFactory(MyComponent, {
  title: "Default title",
});

factory({
  title: "Test title",
});
```

The direct test-level `props` override the factory-level default props.

The same principle applies to slots.

Direct `slots` passed to `factory()` take precedence over factory-level `defaultSlots`.

Props and slots are therefore resolved separately from the managed plugin configuration layering model described above.

---

<a id="execution-flags"></a>

## 4. 🎛️ Execution Flags

TestForge provides advanced flags for cases where the default configuration flow needs to be adjusted for a specific factory invocation.

These flags are split between:

- `extraOptions` — the fourth argument of `factory()`;
- selected execution options inside `mountOptions` — the second argument of `factory()`.

### 4.1. `extraOptions`

`extraOptions` is the fourth argument of `factory()`. It contains framework-level controls that affect configuration resolution and execution.

```typescript
factory(props, mountOptions, slots, extraOptions);
```

#### The `preset` Property

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

#### The `skipDefaultProps` Flag

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

#### The `skipDefaultSlots` Flag

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

#### The `skipDefaultOptions` Flag

- **Type:** `boolean`
- **Default:** `false`

When set to `true`, the factory ignores `defaultMountOptions` defined when the factory was created.

This allows the current test to resolve its mount configuration without inheriting factory-level default mount options.

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

Most `mountOptions` are standard Vue Test Utils options.

However, TestForge also supports framework-specific execution flags inside this second argument.

#### The `skipManagedPlugins` Flag

- **Type:** `boolean`
- **Default:** `false`

When set to `true`, TestForge disables managed plugin orchestration for the current mount.

This allows the test to take full manual control over plugin initialization using standard Vue Test Utils `global.plugins`.

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

- the automatically created managed plugin instance does not match the test requirements;
- a pre-created or mocked plugin instance must be used;
- plugins need to be registered in a custom order;
- the test requires non-standard plugin initialization.

> [!IMPORTANT]
> `skipManagedPlugins` disables TestForge's managed plugin orchestration for the current mount. It does not disable Vue Test Utils' own `global.plugins` mechanism.

---

<a id="managed-plugins"></a>

## 5. 🛠 Managed Plugins

Managed plugins are Vue ecosystem integrations that participate in TestForge's managed plugin lifecycle.

Examples include:

- Pinia;
- Vue Router;
- Vue I18n;
- Vuetify;
- PrimeVue;
- PrimeVue 3.

Managed plugins differ from Vue plugins registered directly through Vue Test Utils.

They:

- are declared in the active preset manifest;
- can be configured through TestForge's managed `plugins` API;
- support automatic plugin instance creation;
- support factory-level and test-level configuration;
- support Layer 4 runtime overlays;
- are validated against the active preset.

Every managed plugin has a stable identifier exported by its package through `PLUGIN_NAME`.

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

The Pinia package exports `PLUGIN_NAME` with the value `"pinia"`, which is why runtime configuration uses `plugins.pinia`.

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

Managed plugins are available only when they are registered in the active preset manifest.

The core runtime does not automatically discover or activate managed plugins.

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

The same identifier is represented differently at the two API levels:

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

If a managed plugin is not part of the active preset manifest, TestForge rejects configuration attempts for that plugin.

A package being installed is not enough. The managed plugin must belong to the active runtime profile.

---

### 5.2. Preset Composition with `extendPreset()`

A project-owned preset does not need to extend an existing TestForge preset.

It can be defined independently with an explicit `PresetDefinition`, as shown in the previous section.

TestForge also provides `extendPreset()` when intentional reuse of another preset is useful.

Preset extension is a **composition mechanism**.

It creates a new complete preset from an existing preset plus explicit manifest or default-configuration changes.

It does not introduce inheritance between runtime configuration layers.

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

This is normally preferable when the project wants that configuration to remain explicit and stable across changes to the source preset's Pinia defaults.

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

Because preset defaults are `PluginOptionsFactory` functions, the source factory must be invoked explicitly when its returned options should be reused.

This has different ownership semantics:

```text
explicit materialized factory
→ project owns configuration

spread source preset factory
→ project intentionally follows source preset behavior
```

If the source factory changes after a dependency update, the effective project configuration can change as well.

Use this form only when that coupling is intentional.

#### Manifest Extensions

An extension can also modify the managed plugin capability boundary.

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

Once a project explicitly replaces a plugin factory, the resulting configuration does not silently acquire additional options from the source preset.

If following the source factory is intentional, invoke it explicitly as shown above.

> [!NOTE]
> `extendPreset()` replaces plugin default factories; it does not merge the objects returned by those factories.
>
> Spreading a source factory is an explicit decision to remain coupled to that source configuration.

#### Extension Validation

`extendPreset()` validates the extension before applying it.

The following rules apply:

- a new plugin added to `manifest` must explicitly define `enabled`;
- `defaults` may only contain plugins declared in the resulting manifest;
- plugin defaults must be `PluginOptionsFactory` functions that return valid plugin options;
- `false` is not allowed in preset defaults;
- to disable a plugin by default, use `enabled: false` in the manifest;
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

Plugin keys passed into TestForge configuration points must correspond to plugins declared in the active preset manifest:

- preset `defaults`;
- `defaultMountOptions.plugins`;
- `mountOptions.plugins`;
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

The manifest therefore acts as the capability boundary for managed plugin configuration.

#### Plugin Configuration Values

Runtime managed plugin configuration values can be:

- an options object;
- `false`, to explicitly disable the plugin for the current mount.

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

#### Unmanaged Third-Party Plugins

Vue plugins that are not registered as managed TestForge integrations must not be passed through the managed `plugins` object.

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

This keeps TestForge-managed plugin configuration separate from raw Vue Test Utils plugin registration.

Managed plugins participate in TestForge's preset, validation, and lifecycle pipeline.

Manually registered Vue plugins bypass that pipeline and are passed directly to Vue Test Utils.

---

### 5.4. Practical Examples

A plugin declared in a preset manifest can be dynamically enabled or disabled depending on test requirements.

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

This can be useful when the test does not need Router or when the test intends to take manual control over the environment.

#### Enabling a Plugin Disabled by Default

If a plugin is declared in the active preset manifest with `enabled: false`, you can activate it for an individual test by passing an empty configuration object:

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

This allows a preset to make an integration available without initializing it for every component test.

---

<a id="third-party-plugins"></a>

## 6. 🔌 Third-Party Plugins

TestForge-managed plugins are integrated into the framework's configuration and preset lifecycle pipeline.

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

Plugins registered through `global.plugins` bypass TestForge's managed plugin processing.

### Managed vs Manually Registered Plugins Quick Reference

| Configuration Key | Allowed Plugins                                                       | Pipeline Integration                                                  |
| :---------------- | :-------------------------------------------------------------------- | :-------------------------------------------------------------------- |
| `plugins`         | **Managed only** — identifiers declared in the active preset manifest | Participates in presets, validation, lifecycle handling, and overlays |
| `global.plugins`  | **Manually registered Vue plugins**                                   | Bypasses TestForge and is passed directly to Vue Test Utils           |

This table intentionally does not duplicate the list of official managed plugin identifiers.

See [Getting Started → Managed Plugin Identifiers](./getting-started.md#managed-plugin-identifiers) for the canonical list.

### When to Use `global.plugins`

Use the standard Vue Test Utils array when:

- the Vue plugin is not supported or managed by TestForge;
- the test requires a custom, manually pre-instantiated plugin;
- you need to bypass TestForge's managed lifecycle pipeline for a specific dependency.

> [!TIP]
> If you need to work directly with underlying instances of managed plugins such as Pinia or Router, see [Advanced: Working with Plugin Instances](#plugin-instances).

---

<a id="plugin-instances"></a>

## 7. 🛡 Advanced: Working with Plugin Instances

In most cases, you do not need to interact directly with plugin instances.

However, doing so is useful when you need to assert the internal state of **Pinia**, **Vue Router**, or **Vue I18n** after a component has performed an action.

<a id="precreated-plugin-instances"></a>

### 7.1. Using Pre-created Instances (`__meta.instance`)

Sometimes a test requires an **already existing** plugin instance — for example, a Pinia instance pre-populated with mock state via `@pinia/testing`, or a fully configured Router — instead of letting the framework initialize a new one.

For this purpose, managed plugins support a protected `__meta.instance` property inside `extraOptions.plugins`:

```typescript
import { createTestingPinia } from "@pinia/testing";

const sharedPinia = createTestingPinia();

const factory = testComponentFactory(MyComponent);

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

- managed plugin lifecycle creation is completely skipped;
- standard plugin options specified alongside it are ignored;
- the supplied instance is injected directly into the Vue Test Utils mounting pipeline.

> [!WARNING]
> Any other plugin options specified alongside `__meta.instance` will be ignored because the provided instance takes precedence.

#### Why is this better than `global.plugins`?

Using `__meta.instance` allows TestForge to recognize that the managed plugin already exists.

This prevents the framework from creating a second instance and keeps the plugin inside the managed preset lifecycle.

> [!NOTE]
> **Choosing Between `__meta.instance` and `skipManagedPlugins`:**
>
> - Use `__meta.instance` when you want to provide a custom instance for **one specific managed plugin** while still allowing TestForge to orchestrate the other managed plugins from the active preset.
> - Use `skipManagedPlugins: true` when you want to **completely opt out** of TestForge's managed plugin pipeline for the current mount and manually construct the environment through Vue Test Utils.

#### When should `__meta.instance` be used?

- **State Sharing** — when you need to share the exact same plugin instance across multiple helpers or assertions.
- **Complex Preparation** — when you want to manually prepare complex runtime state before mounting the component.

> [!NOTE]
> Providing `__meta.instance` is mainly useful for plugins that maintain meaningful runtime state, such as **Pinia** or **Vue Router**.
>
> Plugins implemented primarily as install objects, such as **Vuetify** or **PrimeVue**, generally do not benefit from instance reuse in the same way.

---

<a id="accessing-plugin-instances"></a>

### 7.2. Accessing Plugin Instances

Sometimes tests need direct access to the actual plugin instance created by the framework pipeline to run assertions against its runtime state.

#### Option A: Using `expose`

You can pass an `expose` callback that receives the freshly created instance immediately before the component mounts.

```typescript
import type { Pinia } from "pinia";

let piniaInstance: Pinia;

const factory = testComponentFactory(MyComponent);

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

expect(piniaInstance).toBeDefined();
```

---

#### Option B: Using `captureInstance` (Recommended)

`captureInstance()` is a convenient helper built on top of `expose` that stores the instance reference inside a wrapper object for clean access in assertions.

```typescript
const piniaCapture = captureInstance();

const factory = testComponentFactory(MyComponent);

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
> **Full TypeScript Support:** You do not need to pass explicit generic types to `captureInstance()`. The framework automatically infers the correct plugin type (`Pinia`, `Router`, etc.) based on the context object key where the capture helper is spread.

> [!NOTE]
> Plugin instances are created before component mounting. Both the `expose` callback and `captureInstance()` receive the instance immediately before `mount()` or `shallowMount()` is executed.

---

<a id="instance-isolation"></a>

### 7.3. Instance Isolation

Each component factory invocation creates an isolated runtime environment.

Managed plugin instances created for one mount are not automatically shared with another factory invocation.

This prevents state from leaking between tests.

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

When a test intentionally requires a shared plugin instance — for example, to share state across multiple mounts or helpers — do not rely on automatic managed instance creation.

Instead, explicitly create the instance and pass it through `__meta.instance` as described in [Section 7.1](#precreated-plugin-instances).
