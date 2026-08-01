# 🏗️ Architectural Overview: The Plugin & Preset Matrix

`@testforge/vue-test-core` implements a **strict microkernel architecture**. The core engine is completely blind: it has zero internal knowledge of Pinia, Vue Router, vue-i18n, or any other library. It contains no global registries or hardcoded plugin configurations.

Instead, the entire testing environment is driven by **Presets** and a hierarchical **State Layering Pipeline**.

---

## 1. Presets as Runtime Environment Profiles

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

This guarantees that presets behave as isolated runtime environments rather than partial configuration overlays.

**Important:** If `mountOptions.plugins` or `extraOptions.plugins` contains configuration for a plugin that is **not declared** in the active preset’s manifest, the framework will throw a validation error.

For example, if `i18nPreset` only declares `i18n`, the `pinia`
configuration above is invalid.

This behavior is intentional. Presets are treated as isolated runtime
environments rather than partial configuration overlays.
