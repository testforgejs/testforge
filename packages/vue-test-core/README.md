## 🏗️ Architectural Overview: The Plugin & Preset Matrix

`@testforge/vue-test-core` implements a **strict microkernel architecture**. The core engine is completely blind: it has zero internal knowledge of Pinia, Vue Router, vue-i18n, or any other library. It contains no global registries or hardcoded plugin configurations.

Instead, the entire testing environment is driven by **Presets** and a hierarchical **State Layering Pipeline**.

---

### 1. Presets as Runtime Environment Profiles

A Preset in TestForge is not just a collection of convenient defaults. It acts as:

- **A Runtime Environment Profile:** It dictates which parts of your application stack are alive during a test run.
- **A Plugin Capability Boundary:** It defines the exact boundary of what can be configured. If a plugin isn't declared in the active preset manifest, its configuration is considered invalid and the framework will reject it during validation.
- **A Dependency Graph Declaration:** It maps runtime plugin modules to their core names and initial lifecycle hooks.

A preset defines two critical fields:

- `manifest`: Declares _"What plugins are registered and available in this runtime ecosystem?"_
- `defaults`: Declares _"What is the global project-wide baseline configuration for these plugins?"_

#### Preset Structure Example

```javascript
const presets = {
  default: {
    manifest: [
      { module: piniaPlugin, enabled: true },
      { module: i18nPlugin, enabled: false },
    ],
    defaults: {
      pinia: {
        stubActions: true,
      },
      i18n: {
        locale: "uk",
        messages: { ... },
      },
    },
  },
  i18nOnly: {
    manifest: [{ module: i18nPlugin, enabled: true }],
    defaults: {
      i18n: {
        locale: "en",
        messages: { ... },
      },
    },
  },
};
```

### ⚠️ Preset Runtime Boundaries

Presets define the complete managed plugin runtime.

If a plugin is not declared in the active preset manifest, configuring it is considered invalid.

```javascript
factory(
  {},
  {
    plugins: {
      pinia: {},
    },
  },
  {},
  {
    preset: "i18nPreset",
  },
);
```

If `i18nPreset` only declares `i18n`, the framework will reject the pinia configuration.

This guarantees that presets behave as isolated runtime environments rather than partial configuration overlays.

**Important:** If `mountOptions.plugins` or `extraOptions.plugins` contains configuration for a plugin that is **not declared** in the active preset’s manifest, the framework will throw a validation error.

For example, if `i18nPreset` only declares `i18n`, the `pinia`
configuration above is invalid.

This behavior is intentional. Presets are treated as isolated runtime
environments rather than partial configuration overlays.

---

### 2. The 4-Tier State Layering Hierarchy

When a plugin's configuration (like Pinia's `initialState` or Router's `routes`) is resolved, it travels through four distinct architectural layers. Each layer can selectively override or adjust the state inherited from the previous one:

| Layer                         | Defined At               | Scope                             | Merge Type against previous |
| :---------------------------- | :----------------------- | :-------------------------------- | :-------------------------- |
| **1. Preset Defaults**        | Global Framework Setup   | Whole Monorepo / Project          | _Base Baseline_             |
| **2. `defaultMountOptions`**  | `testComponentFactory()` | Test File / Component Suite       | **Shallow Overwrite**       |
| **3. `mountOptions`**         | `factory()` invocation   | Specific `it()` or `test()` block | **Shallow Overwrite**       |
| **4. `extraOptions.plugins`** | `factory()` 4th argument | Precision fine-tuning             | **Shallow Patch (Overlay)** |

---

### ⚙️ Configuration & Mounting Signatures

The framework is fully compatible with [Vue Test Utils (VTU)](https://vuejs.org) and supports all standard mounting options.

```javascript
// 1. Factory Creation (File-Level Configuration Baseline)
const factory = testComponentFactory(
  Component,
  defaultProps, // 1st arg: Base props
  defaultMountOptions, // 2nd arg: Layer 2 plugin overrides & base VTU options
  defaultSlots, // 3rd arg: Base slots
);

// 2. Factory Execution (Test-Level Specific Delta)
const wrapper = factory(
  props, // 1st arg: Highest priority direct props
  mountOptions, // 2nd arg: Layer 3 plugin overrides & test VTU options
  slots, // 3rd arg: Highest priority direct slots
  extraOptions, // 4th arg: Layer 4 precision plugin overlays & pipeline flags
);
```

### Priority and Merge Strategies

#### 1. Flat VTU Options (Shallow Merge)

Options such as `data`, `attrs`, `attachTo`, and `shallow` are merged using a **shallow merge** strategy between Layer 2 (`defaultMountOptions`) and Layer 3 (`mountOptions`).

- **`shallow` (Boolean)**: Standard Vue Test Utils option that controls whether the component is mounted using `mount()` or `shallowMount()`.
  - **Framework Default:** `false` (`mount()` is used).
  - **Global Override:** `createTestFramework({ shallowByDefault: true })` switches the framework default to use `shallowMount()`.
  - **Per-Test Override:** The `shallow` option inside `defaultMountOptions` or `mountOptions` always takes precedence over `shallowByDefault`.

**Resolution order:**

1. `mountOptions.shallow`
2. `defaultMountOptions.shallow`
3. Global `shallowByDefault` configuration
4. `false` (fallback to full `mount()`)

**Example Usage:**

```javascript
// 1. Global Setup: Enable shallow mounting across the whole project
const { testComponentFactory } = createTestFramework({
  shallowByDefault: true,
});

// 2. Factory / Test Level: Force full render for a specific container test
const factory = testComponentFactory(
  MyContainer,
  {},
  {
    shallow: false, // Forces full mount() overriding the global shallowByDefault flag
  },
);
```

- **Props & Slots Priority**: Direct arguments (`props` as 1st arg, `slots` as 3rd arg) represent immediate test intent. They have the absolute highest priority and will completely override any props or slots passed inside the `mountOptions` configuration object. If `props` or `slots` are specified both as direct factory arguments and inside `mountOptions`, the direct arguments always take precedence.

#### 2. The `global` Section (Deep Merge)

Standard VTU `global` options (`stubs`, `mocks`, `provide`) are processed using a **deep merge** strategy across Layer 2 and Layer 3. This allows seamless "layering" of test-double infrastructure (e.g., adding a stub in a test does not wipe out base stubs defined in the factory).

#### 3. Managed Plugins Override (Layer 2 vs Layer 3 vs Layer 4)

Because managed plugins control critical application state, their merging behavior is carefully designed to protect against **test data pollution**:

- **Full State Reset (Layers 2 & 3 via `plugins`)**: Inside both `defaultMountOptions` and `mountOptions`, managed plugin configurations are placed inside the `plugins` key (e.g., `mountOptions: { plugins: { pinia: { ... } } }`).
  - **Behavior:** When Layer 3 defines a plugin configuration block, it **completely replaces** that plugin's block from Layer 2 and Layer 1. This guarantees a clean, unpolluted state (e.g., a test-level `initialState` will completely discard the factory baseline state rather than merging keys).
- **Fine-Grained Patching (Layer 4 via `extraOptions.plugins`)**: If you do _not_ want to wipe out the inherited plugin configuration, but only want to tune a specific property, use the `plugins` property inside `extraOptions`.
  - **Behavior:** `extraOptions.plugins` acts as a **Shallow Overlay** on top of the already resolved plugin state.
  - _Example:_ If Layer 1 and 2 established a complex base store state, and your test only needs to toggle action stubbing without redeclaring that state, you pass it inside the 4th argument: `factory({}, {}, {}, { plugins: { pinia: { stubActions: true } } })`. The inherited state is preserved, and the stub flag is overlaid.

#### Why Do Layers 2 and 3 Use Full Replacement for Managed Plugins?

Managed plugins control **application state** (`initialState`, `messages`, `routes`, etc.).  
Deep merging could lead to **test data pollution**. For example:

- Base configuration contains 10 users in `initialState`.
- In a test you want an empty array.

Deep merging could concatenate arrays instead of replacing them. That’s why on Layers 2 and 3 the plugin configuration **completely replaces** the previous one.

---

### 🚫 Advanced Pipeline Controls

All advanced framework-specific flags are isolated at the root level of the 4th argument (`extraOptions`) to keep them completely separate from business plugin configurations.

#### The `preset` Property

- **Type:** `keyof TestFrameworkPresets`
- **What it does:** Allows dynamically switching or activating a specific preset profile from your project's presets registry for this individual factory call.

#### The `skipDefaultProps` / `skipDefaultSlots` Flags

- **Type:** `Boolean` (Default: `false`)
- **What it does:** If set to `true`, the factory completely ignores the `defaultProps` or `defaultSlots` specified during factory creation for this specific test run.

#### The `skipDefaultOptions` Flag

- **Type:** `Boolean` (Default: `false`)
- **What it does:** Tells the pipeline to completely ignore `defaultMountOptions` defined during factory creation, forcing the current test to resolve only against Global Preset Defaults and immediate `mountOptions`.

#### The `skipManagedPlugins` Flag

_Note: This flag remains inside `mountOptions` (2nd execution argument)._

- **Type:** `Boolean` (Default: `false`)
- **What it does:** Completely disables the active preset orchestration for the current test run. Use this when you need to take full manual control over plugin initialization using raw VTU arrays.

#### When is it useful?

Use this option when you need to **take full manual control** over plugin creation and registration, for example:

- when the default behavior of `createPiniaPlugin`, `createI18nPlugin` or `createRouterPlugin` conflicts with your test requirements
- when you want to use pre-created / mocked / stubbed plugin instances
- when plugins need to be registered in a custom order or with non-standard configuration

#### Usage example

```javascript
const wrapper = factory(
  {},
  {
    skipManagedPlugins: true,
    global: {
      plugins: [
        customPiniaInstance, // manually created instance
        // other plugins as needed
      ],
    },
  },
);
```

---

## 🛠 Managed Plugins

The framework provides enhanced support for several core Vue ecosystem plugins through a managed lifecycle pipeline.

### Currently supported plugins:

- **`pinia`**
- **`i18n`**
- **`router`**

Managed plugins differ from standard VTU plugins because they:

- participate in the preset system
- support hierarchical configuration layering
- support automatic instance creation
- support runtime overlays through extraOptions.plugins
- are validated against the active preset manifest

### Configuration Levels

Managed plugins can be configured at three levels:

1. Preset Defaults (Layer 1)

```javascript
createTestFramework({
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

2. Factory-Level Configuration (Layer 2)

```javascript
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

3. Test-Level Configuration (Layer 3)

```javascript
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

4. Overlay Configuration (Layer 4)

```javascript
// Base configuration (Layer 1 + 2): initialState + stubActions: true

factory(
  {},
  {},
  {},
  {
    plugins: {
      pinia: {
        stubActions: false, // only changing this flag
        // initialState remains from previous layers
      },
    },
  },
);
```

Layer 4 patches the already resolved configuration instead of replacing it.

### 🔄 Using Pre-created Instances (`__meta.instance`)

Sometimes in tests you need to use an **already existing** plugin instance (for example, a Pinia instance with pre-populated state or a fully configured Router), instead of letting the framework create one.

For this purpose, managed plugins support a protected `__meta.instance` property:

```javascript
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

- plugin creation is skipped
- plugin configuration is ignored
- the supplied instance is injected directly into Vue Test Utils

Any other plugin options specified alongside `__meta.instance` are ignored because the provided instance takes priority.

**Why is this better than `global.plugins`?**

Using `__meta.instance` allows the framework to recognize that the
managed plugin already exists and prevents creation of a second instance.

This avoids conflicts between multiple copies of the same plugin and
keeps the managed plugin lifecycle consistent with the preset pipeline.

### Configuration Validation

The framework performs strict validation:

- Keys in `defaults` and `plugins` must correspond to plugins declared in the active preset’s manifest.
- Plugin values can only be an `Object` or `false`.
- Passing third-party plugins (e.g. `vuetify`) into the `plugins` object will cause an error.

#### Disabling Managed Plugins

You can completely disable any managed plugin for a specific test by passing `false`:

```javascript
factory(
  {},
  {
    plugins: {
      pinia: false, // Pinia will not be created
      router: false, // Router will not be created
    },
  },
);
```

This is useful when you need full manual control over the environment or want to avoid conflicts.

---

## 🔌 Third-Party Plugins

Plugins that are not managed by the framework should be registered using the standard Vue Test Utils mechanism:

```javascript
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

| Mechanism        | Purpose                                     |
| ---------------- | ------------------------------------------- |
| `plugins`        | Managed plugins (`pinia`, `i18n`, `router`) |
| `global.plugins` | Third-party Vue plugins                     |

Managed plugins participate in the preset pipeline.  
Third-party plugins are passed directly to Vue Test Utils without additional processing.

---

## 🧩 Accessing Plugin Instances

Sometimes tests need direct access to the actual plugin instance.

### Using `expose`

```javascript
let piniaInstance;

factory(
  {},
  {
    plugins: {
      pinia: {
        expose(instance) {
          piniaInstance = instance;
        },
      },
    },
  },
);
```

> [!NOTE]
> Plugin instances are created before component mounting. Both the `expose` callback and `captureInstance()`
> receive the instance immediately before `mount()` or `shallowMount()` is executed.

### Using `captureInstance` (Recommended)

`captureInstance()` is a small helper built on top of `expose` that stores the instance reference for later access in assertions.

```javascript
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
> In TypeScript, you can provide the instance type explicitly:
>
> ```ts
> const i18nCapture = captureInstance<I18n>();
> ```
>
> Otherwise `instance` is typed as `unknown`.

### Instance Isolation

Every call to `factory()` creates a completely new runtime environment.

Pinia, Router and i18n instances are never shared between factory invocations.

Captured instances from previous tests have no relation to instances created in subsequent tests.

---

## ======================================================================

## ⚙️ Configuration (Mount Options)

The framework is fully compatible with [Vue Test Utils (VTU)](https://test-utils.vuejs.org) and supports all standard mounting options. However, it extends their processing logic to make settings reuse more convenient and predictable.

### Priority and Merge Types

Settings are merged from three sources (in ascending order of priority):

1. **`defaultMountOptions`** — defined when creating the factory.
2. **`mountOptions`** — passed in a specific test.
3. **`props` / `slots`** — separate arguments of the factory function (highest priority).

#### 1. Flat VTU Options (Shallow Merge)

Options such as `props`, `data`, `attrs`, `attachTo`, `slots`, and `shallow` are merged using **shallow merge**.

- **`shallow` (Boolean)** — controls which mounting method from [Vue Test Utils](https://test-utils.vuejs.org) is used.
  - **Default:** `true` (uses `shallowMount`).
  - **Behavior:** If set to `false`, the component will be mounted using `mount` (full rendering of child components).
  - **Priority:** As with other flat options, the value from `mountOptions` overrides the value from `defaultMountOptions`.
- If you pass `props` both as a separate factory argument **and** inside `mountOptions`, the value from the separate argument **overrides** the value from the options object.
- Test-level settings always completely replace same-named settings from `defaultMountOptions`.

#### 🚫 `skipManagedPlugins` Option

In the second argument (`mountOptions`), you can pass the `skipManagedPlugins` flag.

- **Type:** `Boolean`
- **Default:** `false`
- **What it does:** completely disables the built-in managed plugins registry for the current test

#### When is it useful?

Use this option when you need to **take full manual control** over plugin creation and registration, for example:

- when the default behavior of `createPiniaPlugin`, `createI18nPlugin` or `createRouterPlugin` conflicts with your test requirements
- when you want to use pre-created / mocked / stubbed plugin instances
- when plugins need to be registered in a custom order or with non-standard configuration

#### Usage example

```javascript
const wrapper = factory(
  {},
  {
    skipManagedPlugins: true,
    global: {
      plugins: [
        customPiniaInstance, // manually created instance
        // other plugins as needed
      ],
    },
  },
);
```

#### 2. `global` Section (Deep Merge)

The `global` object (`stubs`, `mocks`, `provide`, `plugins`, etc.) is processed with **deep merge**.

- This allows “layering” mocks and stubs. If a `Button` stub is defined in the base config and an `Icon` stub is added in the test, **both** stubs will be available in the final component.
- **Exception:** If you want to completely ignore base settings, use the `skipDefaultOptions` flag in `extraOptions`.

#### 3. `plugins` Section (Managed Plugins)

The `plugins` section inside `mountOptions` is intended **only** for **managed plugins** (`pinia`, `i18n`, `router`).

- **Merge type:** Shallow. The plugin object from the test completely **replaces** the same plugin object from the base config.  
  This ensures clean state (e.g. Pinia’s `initialState` does not get mixed with base data).

---

### 🧪 `extraOptions` (4th Argument)

This object controls framework-specific behavior and provides tools for fine-grained configuration:

- **`skipDefaultOptions` (Boolean)** — if `true`, the framework completely ignores `defaultMountOptions` from the factory.
- **Plugin-specific overrides (Plugin Overlays)** — plugin keys in `extraOptions` (e.g. `pinia`, `i18n`) have the **highest priority**.
  - **Priority:** `extraOptions` is applied **on top of** the already merged configuration from `defaultMountOptions` + `mountOptions`.
  - **Behavior (Shallow Overlay):** Unlike `mountOptions.plugins` which fully replaces the plugin object from the base, `extraOptions` allows you to **modify or add specific fields** without overwriting the rest of the settings.
  - _Example:_ If the base config has `initialState` for Pinia and you only want to enable `stubActions` in the test, passing `{ pinia: { stubActions: true } }` in `extraOptions` will preserve the base state while updating the stub flag.
- **`__meta.instance`** — allows passing a pre-created plugin instance (see “Using Pre-created Instances” section).
- **Props/Slots control**: `skipDefaultProps` and `skipDefaultSlots` let you ignore base values for these arguments.

---

## 🧩 Settings Merging Logic (Merging Strategy)

The framework architecture separates data into two types: **Dependency Collections** and **State Configurations**. This ensures test predictability and protects against "data pollution" coming from base settings.

### 1. Deep Merge — for `global`

**Applies to:** `stubs`, `mocks`, `provide`, `directives`.

Objects in the `global` section are treated as **toolsets / utility collections**.

- **Behavior:** If `BASE_MOUNT_OPTIONS` defines `mock: { $t }`, and your test adds `mock: { $route }`, the final component will have **both** mocks available.
- **Purpose:** Allows you to gradually extend the test environment without duplicating base stubs in every single file.

### 2. Shallow Merge — for `plugins`

**Applies to:** `pinia` (including `initialState`), `i18n` (including `messages`), `router`.

Plugin settings are treated as **complete, standalone configurations**.

- **Behavior:** The plugin object coming from the test (or from `extraOptions`) **completely replaces** the same-named object from the base settings.
- **Purpose:**
  - **Data cleanliness:** If the base config has `customersList` with 10 items, and your test passes `initialState: { customersList: [] }`, you expect an **empty** list. Deep merging would concatenate arrays and create a mess.
  - **i18n control:** Makes it easy to "reset" a translation branch or replace the locale entirely, without accidentally mixing in unwanted default keys.

---

### 🛠 How to change just one plugin setting without replacing everything?

If you don’t want to replace the entire plugin config, but only modify one option (e.g. change only `locale` in i18n while keeping the base `messages`), use **`extraOptions`** (the 4th argument of the factory).

`extraOptions` is applied **on top of** the base plugin config:

```javascript
// В BASE_MOUNT_OPTIONS: pinia: { stubActions: true, initialState: { a: 1 } }

const wrapper = factory(
  {},
  {},
  {},
  {
    pinia: {
      initialState: { b: 2 }, // Replaces initialState entirely, but preserves stubActions
    },
  },
);
```

---

## 🛠 Configuring Managed Plugins

The framework provides enhanced support for key Vue plugins, automatically injecting base settings and simplifying state management.

### List of Supported Plugins

At the moment, the `plugins` object supports the following keys:

- **`pinia`** — store management, support for `initialState` and automatic creation of spies.
- **`i18n`** — localization, management of translation dictionaries and current locale.
- **`router`** — routing, automatic history mode setup (Memory / Web) and basic route configuration.

---

### Configuration Levels

You can configure plugins at three different levels (in ascending order of priority):

#### 1. Globally in the factory (`BASE_MOUNT_OPTIONS`)

Sets settings that will be shared across all tests in the file.

```javascript
const factory = testComponentFactory(Component, props, {
  plugins: {
    pinia: { stubActions: true },
    i18n: { locale: "en" },
  },
});
```

#### 2. Per-test in (`mountOptions`)

Completely replaces the plugin configuration for the current test only.

```javascript
const wrapper = factory(
  {},
  {
    plugins: {
      pinia: { initialState: { user: { id: 1 } } },
    },
  },
);
```

#### 3. Fine-grained changes via `extraOptions` (4th argument)

Allows you to modify only specific parameters without overwriting the rest of the base configuration.

```javascript
const wrapper = factory(
  {},
  {},
  {},
  {
    i18n: { locale: "uk" }, // This will only change the language while preserving the messages from the database
  },
);
```

### ⚠️ Limitations of the `plugins` section

The `plugins` object is intended **only** for the managed plugins listed above. The framework performs strict validation of these settings:

- Only configuration objects or `false` (to disable the plugin) are allowed.
- Passing third-party plugins (e.g. `Vuetify`, `Vfm`, etc.) into this object will cause an error.

---

### 🔄 Using Pre-created Instances (`__meta.instance`)

Sometimes in tests you need to use an **already existing** plugin instance (for example, a Pinia instance with pre-filled data or a fully configured Router), instead of creating it from scratch via configuration options.

For this purpose, the `extraOptions` object provides a protected key called `__meta`:

```javascript
const mySharedPinia = createTestingPinia({ ... });

const wrapper = factory(props, {}, {}, {
    pinia: {
        __meta: {
            instance: mySharedPinia // Inject the ready-made instance
        },
        // Any other options specified here will be **ignored**,
        // because priority is given to the provided instance.
    }
});
```

**Why is this better than `global.plugins`?**

The framework will automatically skip creating the default plugin instance, preventing a conflict between two copies of the same plugin.

This mechanism ensures that the `instance` field never conflicts with the internal options of the plugins themselves.

---

### When should `__meta.instance` be used?

Providing `__meta.instance` is mainly useful for plugins that maintain
runtime state, such as Pinia, Router or Vue I18n.

Plugins implemented as install objects or install tuples typically do not
benefit from instance reuse because they do not expose meaningful runtime state.

---

### 🔌 Connecting Third-Party Plugins

If you need to connect a plugin that is **not** managed by the framework (for example, `vue-final-modal`, `vuetify`, etc.), use the standard Vue Test Utils mechanism via the `global.plugins` section:

```javascript
const wrapper = factory(
  {},
  {
    global: {
      plugins: [createVfm()],
    },
  },
);
```

#### Key Differences in Usage:

- **`plugins` (Object)** — used **only** for **framework-managed** plugins (`pinia`, `i18n`, `router`).  
  The framework automatically applies defaults, merges settings from `extraOptions`, and prepares the initial state.

- **`global.plugins` (Array)** — used for **any third-party** plugins "as is".  
  This is the standard Vue Test Utils field that accepts an array of already created plugin instances.

### 🧩 Accessing Plugin Instances

Sometimes you need more than just configuring plugins — you may require direct access to the actual `pinia`, `i18n`, or `router` instances for advanced testing or manual manipulation.

There are two ways to obtain these instances:

#### 1. Using the `expose` callback

You can pass an `expose` function in any plugin’s configuration. It will be called immediately after the instance is created, but before the component is mounted.

```javascript
let piniaInstance;

const wrapper = factory(
  {},
  {
    plugins: {
      pinia: {
        expose: (instance) => {
          piniaInstance = instance;
        },
      },
    },
  },
);

// Now you can use piniaInstance in your tests
expect(piniaInstance.state.value).toBeDefined();
```

#### 2. Using the `captureInstance` helper (Recommended)

For cleaner and more convenient code, use the built-in `captureInstance` helper. It eliminates the need to manually declare variables and callback functions.

```javascript
import { captureInstance } from "@/tests/helpers";

const piniaCapture = captureInstance();

const wrapper = factory(
  {},
  {
    plugins: {
      pinia: { ...piniaCapture },
    },
  },
);

// The instance is automatically stored in the `.instance` property
expect(piniaCapture.instance).toBeDefined();
```

#### ⚠️ Important Note on Isolation

Plugin instances are **unique for each call to `factory()`**.

Since every call to the factory creates a completely new environment (its own Pinia, its own i18n, etc.), an instance captured in a previous test has no relation to the new `wrapper`.

**Avoid reusing capture variables across tests.**

Always create a fresh `captureInstance()` for each test, or reset the variable inside `beforeEach` or within the `it` block itself.

```javascript
it("should work with new instance", () => {
  const piniaCapture = captureInstance(); // Create locally for this test

  factory(
    {},
    {
      plugins: {
        pinia: { ...piniaCapture },
      },
    },
  );

  expect(piniaCapture.instance).toBeDefined();
});
```

> [!NOTE]
> The instance becomes available in the capture object (the `expose` callback is invoked) **right before** `shallowMount` or `mount` is called.

## 🎛️ Presets

Presets allow you to group plugin settings and module manifests for quick switching between different environment configurations (e.g. `lightweight`, `full-features`, or `i18n-only`).

### Preset Structure

Each preset consists of two key parts:

1. **manifest**: A list of available plugins and their default state (`enabled: true/false`).
2. **defaults**: Base settings for each plugin.

```javascript
const myPresets = {
  apiOnly: {
    manifest: [
      { module: piniaPlugin, enabled: true },
      { module: i18nPlugin, enabled: false },
    ],
    defaults: {
      pinia: { initialState: { user: null } },
    },
  },
};
```

### Framework Initialization

Pass the presets object when creating the test framework:

```javascript
const { testComponentFactory } = createTestFramework({
  presets: myPresets,
});
```

### Usage in Tests

You can switch presets or override their settings directly in `testComponentFactory`:

1. **Selecting a Preset**

   Use `extraOptions` (the fourth argument) to specify the preset name:

   ```javascript
   // Uses the configuration from the 'apiOnly' preset
   const wrapper = factory({}, {}, {}, { preset: "apiOnly" });
   ```

#### ⚠️ Presets Define the Entire Managed Plugin Runtime

A preset defines the complete managed plugin runtime environment.

Switching presets replaces the entire supported plugin manifest, not just plugin defaults.

This means that plugins not declared in the active preset manifest are ignored, even if configuration for them is provided in `mountOptions.plugins` or `extraOptions`.

```javascript
const wrapper = factory(
  {},
  {
    plugins: {
      pinia: { initialState: { user: { id: 1 } } },
    },
  },
  {},
  {
    preset: "i18nPreset",
  },
);
```

If `i18nPreset` only declares the `i18n` plugin in its manifest, the `pinia` configuration above will be ignored and no Pinia instance will be created.

This behavior is intentional.

Presets are treated as isolated runtime environments rather than configuration overlays. This allows tests to use lightweight plugin configurations and avoid unnecessary plugin initialization.

2. **Overriding Settings (Merge)**

   Settings from `mountOptions.plugins` are automatically merged with the `defaults` of the active preset:

   ```javascript
   const wrapper = factory(
     {},
     {
       plugins: {
         pinia: { initialState: { user: { id: 1 } } },
       },
     },
     {},
     { preset: "apiOnly" },
   );
   ```

3. **Manually Disabling a Plugin**

   Even if a plugin is enabled in the preset, you can force-disable it for a specific test:

   ```javascript
   const wrapper = factory({}, { plugins: { pinia: false } });
   ```

### Validation

The framework strictly validates presets:

- Keys in `defaults` must correspond to plugins listed in the `manifest`.
- Plugin options must be either an **Object** or **Boolean (false)**. `null`, strings, or numbers will trigger a validation error.
