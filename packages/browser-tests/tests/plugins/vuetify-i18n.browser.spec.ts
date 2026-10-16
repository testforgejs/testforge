import { afterEach, describe, test, expect } from "vitest";
import { page } from "vitest/browser";
import { defineComponent, h } from "vue";
import { useI18n } from "vue-i18n";
import { useLocale } from "vuetify";
import { createVueI18nAdapter } from "vuetify/locale/adapters/vue-i18n";
import {
  createTestFramework,
  captureInstance,
  fromPluginInstance,
  type PresetDefinition,
} from "@testforgejs/vue-test-core";
import { i18nPlugin, PLUGIN_NAME as I18N_PLUGIN_NAME } from "@testforgejs/vue-test-plugin-i18n";
import {
  vuetifyPlugin,
  PLUGIN_NAME as VUETIFY_PLUGIN_NAME,
} from "@testforgejs/vue-test-plugin-vuetify";

// -----------------------------------------------------------------------------
// Test component

// -----------------------------------------------------------------------------
const TestComponent = defineComponent({
  name: "LocaleIntegrationProbe",
  setup() {
    const { locale, t } = useI18n({
      useScope: "global",
    });
    const vuetifyLocale = useLocale();
    const switchLocale = () => {
      locale.value = locale.value === "en" ? "uk" : "en";
    };
    return () =>
      h("div", [
        h("p", { "data-testid": "i18n-locale" }, locale.value),
        h("p", { "data-testid": "vuetify-locale" }, vuetifyLocale.current.value),
        h("p", { "data-testid": "i18n-translation" }, t("greeting")),
        h("p", { "data-testid": "vuetify-translation" }, vuetifyLocale.t("$vuetify.open")),
        h(
          "button",
          {
            type: "button",
            onClick: switchLocale,
          },
          "Switch locale",
        ),
      ]);
  },
});

// -----------------------------------------------------------------------------
// Test preset

// -----------------------------------------------------------------------------
const preset = {
  manifest: [
    {
      module: i18nPlugin,
      enabled: true,
    },
    {
      module: vuetifyPlugin,
      enabled: true,
    },
  ],
  defaults: {
    [I18N_PLUGIN_NAME]: () => ({
      legacy: false,
      locale: "en",
      fallbackLocale: "en",
      messages: {
        en: {
          greeting: "Hello",
          $vuetify: {
            open: "Open from Vue I18n",
          },
        },
        uk: {
          greeting: "Привіт",
          $vuetify: {
            open: "Відкрити через Vue I18n",
          },
        },
      },
    }),
    [VUETIFY_PLUGIN_NAME]: () => ({
      locale: {
        locale: "en",
      },
    }),
  },
} satisfies PresetDefinition;
const { testComponentFactory } = createTestFramework({
  preset,
});
const factory = testComponentFactory(TestComponent);

// -----------------------------------------------------------------------------
// Test helpers

// -----------------------------------------------------------------------------
type ProbeFactory = typeof factory;
type ProbeMountOptions = NonNullable<Parameters<ProbeFactory>[1]>;
type ProbeLocator = ReturnType<typeof page.getByTestId>;
interface LocaleState {
  i18nLocale: string;
  vuetifyLocale: string;
  i18nTranslation: string;
  vuetifyTranslation: string;
}
interface MountProbeOptions {
  mountFactory?: ProbeFactory;
  testId?: string;
}
const mountedComponents: Array<{
  wrapper: ReturnType<ProbeFactory>;
  container: HTMLDivElement;
}> = [];

/*
 * Mounts the test component through TestForge and attaches it
 * to the real browser DOM.
 *
 * The mounted component is automatically cleaned up after the test.
 */

function mountProbe(
  mountOptions: Omit<ProbeMountOptions, "attachTo"> = {},
  { mountFactory = factory, testId = "locale-probe" }: MountProbeOptions = {},
): ProbeLocator {
  const container = document.createElement("div");
  container.dataset.testid = testId;
  document.body.appendChild(container);
  try {
    const wrapper = mountFactory(
      {},
      {
        ...mountOptions,
        attachTo: container,
      },
    );
    mountedComponents.push({
      wrapper,
      container,
    });
    return page.getByTestId(testId);
  } catch (error) {
    container.remove();
    throw error;
  }
}

/*
 * Creates a deferred Vuetify locale adapter from the Vue I18n
 * instance managed by TestForge.
 *
 * The optional callback allows tests to inspect the resolved instance.
 */

function createAdapterReference(onResolve?: (instance: unknown) => void) {
  return fromPluginInstance(I18N_PLUGIN_NAME, (i18n) => {
    onResolve?.(i18n);
    return createVueI18nAdapter({
      i18n,
      useI18n,
    });
  });
}

/*
 * Verifies the current locale and translation state of both plugins.
 */
async function expectLocaleState(root: ProbeLocator, state: LocaleState) {
  await expect.element(root.getByTestId("i18n-locale")).toHaveTextContent(state.i18nLocale);
  await expect.element(root.getByTestId("vuetify-locale")).toHaveTextContent(state.vuetifyLocale);
  await expect
    .element(root.getByTestId("i18n-translation"))
    .toHaveTextContent(state.i18nTranslation);
  await expect
    .element(root.getByTestId("vuetify-translation"))
    .toHaveTextContent(state.vuetifyTranslation);
}

// -----------------------------------------------------------------------------
// Tests

// -----------------------------------------------------------------------------
describe("Vue I18n and Vuetify Browser Integration", () => {
  /**
   * Unmounts all components created during the current test.
   *
   * Components are unmounted in reverse creation order.
   */

  afterEach(() => {
    for (const { wrapper, container } of mountedComponents.splice(0).reverse()) {
      try {
        wrapper.unmount();
      } finally {
        container.remove();
      }
    }
  });

  /**
   * Vuetify must use the Vue I18n instance resolved through TestForge
   * and react to changes in its locale.
   */

  test("should synchronize Vuetify locale with Vue I18n through a plugin instance reference", async () => {
    const i18nCapture = captureInstance();
    let resolvedI18n: unknown;
    const root = mountProbe({
      plugins: {
        [I18N_PLUGIN_NAME]: {
          ...i18nCapture,
        },
        [VUETIFY_PLUGIN_NAME]: {
          locale: {
            adapter: createAdapterReference((instance) => {
              resolvedI18n = instance;
            }),
          },
        },
      },
    });
    // Verify that the dependency resolver receives the actual Vue I18n instance.
    expect(i18nCapture.instance).toBeDefined();
    expect(resolvedI18n).toBe(i18nCapture.instance);
    // Verify the initial locale and translations.
    await expectLocaleState(root, {
      i18nLocale: "en",
      vuetifyLocale: "en",
      i18nTranslation: "Hello",
      vuetifyTranslation: "Open from Vue I18n",
    });
    // Change the locale through a real browser interaction.
    await root.getByRole("button", { name: "Switch locale" }).click();
    // Verify that both plugins react to the same locale change.
    await expectLocaleState(root, {
      i18nLocale: "uk",
      vuetifyLocale: "uk",
      i18nTranslation: "Привіт",
      vuetifyTranslation: "Відкрити через Vue I18n",
    });
  });

  /**
   * Vue I18n and Vuetify must maintain independent locale state
   * when no Vue I18n adapter is configured.
   */

  test("should keep Vuetify locale independent without a Vue I18n adapter", async () => {
    // Mount both managed plugins without declaring an instance dependency.
    const root = mountProbe();
    // Both plugins initially use English.
    await expectLocaleState(root, {
      i18nLocale: "en",
      vuetifyLocale: "en",
      i18nTranslation: "Hello",
      vuetifyTranslation: "Open",
    });
    // Change only the Vue I18n locale.
    await root.getByRole("button", { name: "Switch locale" }).click();
    // Vue I18n updates, while Vuetify remains on its independent English locale.
    await expectLocaleState(root, {
      i18nLocale: "uk",
      vuetifyLocale: "en",
      i18nTranslation: "Привіт",
      vuetifyTranslation: "Open",
    });
  });

  /**
   * Consecutive mounts must create independent plugin instances and resolve
   * a shared instance reference against the current mount's Vue I18n instance.
   *
   * Locale changes in one mounted component must not affect the other.
   */

  test("should isolate Vue I18n and Vuetify instances across mounts", async () => {
    const i18nInstances: unknown[] = [];
    const vuetifyInstances: unknown[] = [];
    const resolvedI18nInstances: unknown[] = [];
    // Reuse the exact same reference descriptor across both mounts.
    const sharedAdapterReference = createAdapterReference((instance) => {
      resolvedI18nInstances.push(instance);
    });
    const mountWithCapturedInstances = (testId: string) => {
      const i18nCapture = captureInstance();
      const vuetifyCapture = captureInstance();
      const root = mountProbe(
        {
          plugins: {
            [I18N_PLUGIN_NAME]: {
              ...i18nCapture,
            },
            [VUETIFY_PLUGIN_NAME]: {
              ...vuetifyCapture,
              locale: {
                adapter: sharedAdapterReference,
              },
            },
          },
        },
        { testId },
      );
      i18nInstances.push(i18nCapture.instance);
      vuetifyInstances.push(vuetifyCapture.instance);
      return root;
    };
    // Create two independent Vue applications through the same factory.
    const first = mountWithCapturedInstances("first-mount");
    const second = mountWithCapturedInstances("second-mount");
    // Both managed plugins must capture one instance per mount.
    expect(i18nInstances).toHaveLength(2);
    expect(vuetifyInstances).toHaveLength(2);
    // The shared reference must be resolved once for each mount.
    expect(resolvedI18nInstances).toHaveLength(2);
    // Each mount must receive its own plugin instances.
    expect(i18nInstances[0]).not.toBe(i18nInstances[1]);
    expect(vuetifyInstances[0]).not.toBe(vuetifyInstances[1]);
    // Each reference must resolve to the current mount's Vue I18n instance.
    expect(resolvedI18nInstances[0]).toBe(i18nInstances[0]);
    expect(resolvedI18nInstances[1]).toBe(i18nInstances[1]);
    // Both applications initially use English.
    await expectLocaleState(first, {
      i18nLocale: "en",
      vuetifyLocale: "en",
      i18nTranslation: "Hello",
      vuetifyTranslation: "Open from Vue I18n",
    });
    await expectLocaleState(second, {
      i18nLocale: "en",
      vuetifyLocale: "en",
      i18nTranslation: "Hello",
      vuetifyTranslation: "Open from Vue I18n",
    });
    // Switch the locale only in the first application.
    await first.getByRole("button", { name: "Switch locale" }).click();
    // Vue I18n and Vuetify must synchronize within the first mount.
    await expectLocaleState(first, {
      i18nLocale: "uk",
      vuetifyLocale: "uk",
      i18nTranslation: "Привіт",
      vuetifyTranslation: "Відкрити через Vue I18n",
    });
    // The second application must remain unaffected.
    await expectLocaleState(second, {
      i18nLocale: "en",
      vuetifyLocale: "en",
      i18nTranslation: "Hello",
      vuetifyTranslation: "Open from Vue I18n",
    });
    // Switch the locale in the second application.
    await second.getByRole("button", { name: "Switch locale" }).click();
    // The second application's plugins must synchronize independently.
    await expectLocaleState(second, {
      i18nLocale: "uk",
      vuetifyLocale: "uk",
      i18nTranslation: "Привіт",
      vuetifyTranslation: "Відкрити через Vue I18n",
    });
    // Switch only the first application back to English.
    await first.getByRole("button", { name: "Switch locale" }).click();
    await expectLocaleState(first, {
      i18nLocale: "en",
      vuetifyLocale: "en",
      i18nTranslation: "Hello",
      vuetifyTranslation: "Open from Vue I18n",
    });
    // The second application must preserve its Ukrainian locale.
    await expectLocaleState(second, {
      i18nLocale: "uk",
      vuetifyLocale: "uk",
      i18nTranslation: "Привіт",
      vuetifyTranslation: "Відкрити через Vue I18n",
    });
  });

  /**
   * Plugin instance dependencies must determine initialization order,
   * regardless of the order in which plugins are declared in the manifest.
   *
   * Vuetify is declared before Vue I18n but depends on its runtime instance.
   */

  test("should resolve plugin instance dependencies regardless of manifest order", async () => {
    const reversedPreset = {
      defaults: preset.defaults,
      manifest: [
        {
          module: vuetifyPlugin,
          enabled: true,
        },
        {
          module: i18nPlugin,
          enabled: true,
        },
      ],
    } satisfies PresetDefinition;
    const { testComponentFactory } = createTestFramework({
      preset: reversedPreset,
    });
    const reversedFactory = testComponentFactory(TestComponent);
    const i18nCapture = captureInstance();
    const vuetifyCapture = captureInstance();
    let resolvedI18n: unknown;
    const root = mountProbe(
      {
        plugins: {
          [I18N_PLUGIN_NAME]: {
            ...i18nCapture,
          },
          [VUETIFY_PLUGIN_NAME]: {
            ...vuetifyCapture,
            locale: {
              adapter: createAdapterReference((instance) => {
                resolvedI18n = instance;
              }),
            },
          },
        },
      },
      {
        mountFactory: reversedFactory,
      },
    );
    // Both managed plugins must be initialized successfully.
    expect(i18nCapture.instance).toBeDefined();
    expect(vuetifyCapture.instance).toBeDefined();
    // Vuetify must receive the actual Vue I18n instance,
    // even though Vue I18n appears later in the manifest.
    expect(resolvedI18n).toBe(i18nCapture.instance);
    // Both plugins initially use English.
    await expectLocaleState(root, {
      i18nLocale: "en",
      vuetifyLocale: "en",
      i18nTranslation: "Hello",
      vuetifyTranslation: "Open from Vue I18n",
    });
    // Switch the locale through a real browser interaction.
    await root.getByRole("button", { name: "Switch locale" }).click();
    // Both plugins must remain synchronized.
    await expectLocaleState(root, {
      i18nLocale: "uk",
      vuetifyLocale: "uk",
      i18nTranslation: "Привіт",
      vuetifyTranslation: "Відкрити через Vue I18n",
    });
  });
});
