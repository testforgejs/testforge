# TestForge Preset Creation Guide

Presets in TestForge act as **Runtime Environment Profiles**. They declare which plugins are active for a specific project and define the global baseline configuration for those plugins.

While TestForge provides a `@testforge/vue-test-preset-recommended` package, you will frequently need to create custom, project-specific presets right inside your local applications to tailor the test environment to your business requirements.

## Architecture of a Preset

A preset consists of two main pillars:

1. The `manifest` (**Dependency Graph**): Declares which plugins exist in this runtime environment and whether they are active by default.
2. The `defaults` (**Global Baseline Configuration**): Defines the default options object for each active plugin.

---

## Step-by-Step Implementation

To create a local preset inside a specific project (e.g., an application or a shared business package), follow these steps:

### Step 1: Create a Project Preset Registry

When declaring default options for plugins within your preset, use the TypeScript `satisfies` operator against the specific plugin's options interface. This gives you strict autocompletion without leaking complex generic types to the core framework.

Create a file named `src/tests/presets/myProjectPreset.ts` (or any location suited for your project):

```typescript
import type { TestFrameworkPresets } from "@testforge/vue-test-core";
import { piniaPlugin, type VueTestPiniaOptions } from "@testforge/vue-test-plugin-pinia";
import { i18nPlugin, type VueTestI18nOptions } from "@testforge/vue-test-plugin-i18n";
import { routerPlugin } from "@testforge/vue-test-plugin-router";

export const projectPresets = {
  // 'default' is the standard profile used by factories if no preset name is specified
  default: {
    manifest: [
      { module: piniaPlugin, enabled: true },
      { module: i18nPlugin, enabled: true },
      { module: routerPlugin, enabled: false }, // Available, but turned off by default
    ],
    defaults: {
      // 1. Configure Pinia project baseline
      pinia: {
        initialState: {
          auth: { user: null, token: null },
          theme: { mode: "light" },
        },
        stubActions: false,
      } satisfies VueTestPiniaOptions,

      // 2. Configure i18n project baseline
      i18n: {
        legacy: false,
        locale: "en",
        fallbackLocale: "en",
        messages: {
          en: { welcome: "Welcome" },
          es: { welcome: "Bienvenido" },
        },
      } satisfies VueTestI18nOptions,
    },
  },

  // You can declare alternative, specialized profiles within the same registry
  e2eLike: {
    manifest: [
      { module: piniaPlugin, enabled: true },
      { module: i18nPlugin, enabled: true },
      { module: routerPlugin, enabled: true }, // Router is forced on here
    ],
    defaults: {
      i18n: { locale: "en", messages: {} } satisfies VueTestI18nOptions,
    },
  },
} satisfies TestFrameworkPresets; // 👈 Wires up structural compatibility with the core engine
```

### Understanding `enabled: false`

A plugin declared with `enabled: false` is still registered in the runtime capability graph.

This means:

- the plugin remains available for explicit activation in tests
- plugin-specific typings remain valid
- the pipeline still recognizes the plugin as supported

The plugin is simply disabled by default for this preset profile.

This allows projects to keep heavyweight or optional integrations available without forcing them into every component mount.
:::

---

### Step 2: Feed the Preset into the Test Framework Bootstrapper

Once your custom presets object is ready, pass it during the initialization of your project's main testing entry point (usually where you instantiate `createTestFramework`).

```typescript
// src/tests/setup.ts
import { createTestFramework } from "@testforge/vue-test-core";
import { projectPresets } from "./presets/myProjectPreset.js";

// Initialize the blind core engine and inject your project capability graph
const { testComponentFactory } = createTestFramework({
  presets: projectPresets,
});

// Export the customized factory for your project's components
export { testComponentFactory };
```

---

## 🧠 Preset Best Practices

1. **Keep State Minimal**: Do not put massive mock data structures into the preset's `defaults.pinia.initialState`. The preset should represent a blank canvas or a minimal authenticated state. Specific data mutations belong inside the test file using execution-time `mountOptions` or `extraOptions.plugins`.
2. **Utilize the default Key**: The framework automatically looks for a key named default in your presets registry. Always provide a comprehensive `default` preset that matches 90% of your project's component needs.
3. **Isolate Heavy Plugins**: If a specific plugin is heavy or creates significant runtime side-effects (like full Vue Router instantiation on every mount), add it to the manifest with `enabled: false`. This registers the plugin capability boundary but keeps it dormant until a specific test explicitly re-enables it.
