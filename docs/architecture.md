# 🏗️ Architectural Overview: The Plugin & Preset Matrix

`@testforgejs/vue-test-core` implements a **strict microkernel architecture**. The core engine is completely blind: it has zero internal knowledge of Pinia, Vue Router, vue-i18n, or any other library. It contains no global registries or hardcoded plugin configurations.

Instead, the entire testing environment is driven by **Presets** and a hierarchical **State Layering Pipeline**.

---

## Presets as Runtime Environment Profiles

A Preset in TestForge is not just a collection of convenient defaults. It acts as:

- **A Runtime Environment Profile:** It dictates which parts of your application stack are alive during a test run.
- **A Plugin Capability Boundary:** It defines the exact boundary of what can be configured. If a plugin isn't declared in the active preset manifest, its configuration is considered invalid and the framework will reject it during validation.
- **A Dependency Graph Declaration:** It maps runtime plugin modules to their core names and initial lifecycle hooks.

A preset defines two critical fields:

- `manifest`: Declares _"What plugins are registered and available in this runtime ecosystem?"_
- `defaults`: Declares _"What is the global project-wide baseline configuration for these plugins?"_

### Preset Structure Example

```typescript
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

### Preset Composition

Presets can be composed using `extendPreset()`.

`extendPreset()` creates a new preset from an existing preset while allowing the consuming project to explicitly customize the plugin manifest and plugin defaults.

This provides a controlled way to build project-specific runtime environments without duplicating an entire preset definition.

```typescript
import { extendPreset } from "@testforgejs/vue-test-core";
import { presets as recommendedPresets } from "@testforgejs/vue-test-preset-recommended";
import { vi } from "vitest";

const presets = {
  default: extendPreset(recommendedPresets.default, {
    defaults: {
      pinia: {
        ...recommendedPresets.default.defaults.pinia,
        createSpy: vi.fn,
      },
    },
  }),
};
```

The resulting preset is a new runtime environment profile. It inherits the base preset's manifest and defaults unless they are explicitly overridden by the extension.

#### Explicit Plugin Configuration Replacement

When an extension provides configuration for an existing plugin, that plugin's default configuration is **replaced as a whole**.

TestForge does not deep-merge plugin configuration between the base preset and the extension.

For example, if the base preset contains:

```typescript
defaults: {
  pinia: {
    initialState: {
      user: { id: 1 },
    },
    stubActions: true,
  },
}
```

and the extension provides:

```typescript
defaults: {
  pinia: {
    createSpy: vi.fn,
  },
}
```

the resulting preset contains:

```typescript
defaults: {
  pinia: {
    createSpy: vi.fn,
  },
}
```

The `initialState` and `stubActions` values from the base preset are not implicitly inherited into the overridden `pinia` configuration.

This replacement semantics is intentional. Once a project explicitly configures a plugin, the resulting configuration must be predictable and must not silently acquire additional options from the base preset.

If selected base options should be preserved, they must be copied explicitly:

```typescript
defaults: {
  pinia: {
    ...recommendedPresets.default.defaults.pinia,
    createSpy: vi.fn,
  },
}
```

#### Extending the Plugin Manifest

An extension can also add managed plugins to the base preset.

```typescript
const extendedPreset = extendPreset(basePreset, {
  manifest: [
    {
      module: customPlugin,
      enabled: true,
    },
  ],
  defaults: {
    customPlugin: {},
  },
});
```

A newly added plugin must explicitly define its `enabled` state and provide its default configuration.

An extension may also change the `enabled` state of a plugin already declared in the base manifest.

Preset extensions are validated before the resulting preset is created. Invalid extensions, such as duplicate manifest entries or defaults for undeclared plugins, are rejected immediately.

> [!IMPORTANT]
> `extendPreset()` is a **preset composition mechanism**, not a runtime configuration overlay.
>
> The resulting preset remains an isolated runtime environment with its own complete plugin manifest and resolved defaults.
>
> Runtime test-specific changes should instead use `mountOptions.plugins` or `extraOptions.plugins`.

## ⚠️ Preset Runtime Boundaries

Presets define the complete managed plugin runtime.

If a plugin is not declared in the active preset manifest, configuring it is considered invalid.

```typescript
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

This guarantees that active presets behave as isolated runtime
environments rather than partial runtime configuration overlays.

`extendPreset()` is different: it is a preset composition mechanism
used to construct a new complete preset before the runtime environment
is created. It does not introduce inheritance between active runtime
configuration layers.

**Important:** If `mountOptions.plugins` or `extraOptions.plugins` contains configuration for a plugin that is **not declared** in the active preset’s manifest, the framework will throw a validation error.
