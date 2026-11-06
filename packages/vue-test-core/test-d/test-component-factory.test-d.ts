import { expectError, expectType } from "tsd";
import { createTestFramework, withPluginInstance } from "../dist/index.js";
import { defineComponent } from "vue";
import { mount } from "@vue/test-utils";
// Registers PluginOptionsMap test augmentation
import "./shared-plugin-types.js";

import type { SlotsType } from "vue";
import type { ComponentFactory } from "../dist/index.js";

const MockComponent = defineComponent({
  name: "MockComponent",
  props: {
    title: {
      type: String,
      required: true,
    },
  },
  render() {
    return null;
  },
});

/**
 * Verify createTestFramework options
 */

const preset = {
  manifest: [],
  defaults: {},
};

// Verify single preset
createTestFramework({
  preset,
});

// Verify multiple presets
createTestFramework({
  presets: {
    default: preset,
  },
});

// Verify shallowByDefault
createTestFramework({
  shallowByDefault: true,
});

createTestFramework({
  shallowByDefault: false,
});

// Verify single preset with shallowByDefault
createTestFramework({
  preset,
  shallowByDefault: true,
});

// Verify multiple presets with shallowByDefault
createTestFramework({
  presets: {
    default: preset,
  },
  shallowByDefault: true,
});

// Verify preset and presets are mutually exclusive
expectError(
  createTestFramework({
    preset,
    presets: {
      default: preset,
    },
  }),
);

// Verify invalid option
expectError(
  createTestFramework({
    unknownOption: true,
  }),
);

// Verify invalid preset
expectError(
  createTestFramework({
    preset: {
      manifest: [],
      defaults: {},
      unknownOption: true,
    },
  }),
);

// Verify invalid presets
expectError(
  createTestFramework({
    presets: {
      default: {
        manifest: [],
        defaults: {},
        unknownOption: true,
      },
    },
  }),
);

// Verify invalid shallowByDefault type
expectError(
  createTestFramework({
    shallowByDefault: "true",
  }),
);

// Verify empty options
createTestFramework({});

const framework = createTestFramework();

const factory = framework.testComponentFactory(MockComponent);

/**
 * Verify positional component factory configuration.
 */

// Valid factory configuration.
const configuredFactory = framework.testComponentFactory(
  MockComponent,
  undefined,
  undefined,
  undefined,
  { presetKey: "admin" },
);

expectType<ComponentFactory<typeof MockComponent>>(configuredFactory);

// Empty configuration is allowed.
framework.testComponentFactory(MockComponent, undefined, undefined, undefined, {});

// Explicitly undefined configuration is allowed.
framework.testComponentFactory(MockComponent, undefined, undefined, undefined, undefined);

// Invalid preset key type.
expectError(
  framework.testComponentFactory(MockComponent, undefined, undefined, undefined, {
    presetKey: 123,
  }),
);

// Legacy property is not supported.
expectError(
  framework.testComponentFactory(MockComponent, undefined, undefined, undefined, {
    preset: "admin",
  }),
);

// Unknown configuration property.
expectError(
  framework.testComponentFactory(MockComponent, undefined, undefined, undefined, {
    unknownOption: true,
  }),
);

// Configuration must be an object.
expectError(
  framework.testComponentFactory(MockComponent, undefined, undefined, undefined, "admin"),
);

/**
 * Verify component props inference with factory configuration.
 */

const configuredPropsFactory = framework.testComponentFactory(
  MockComponent,
  () => ({ title: "Default title" }),
  undefined,
  undefined,
  { presetKey: "admin" },
);

// A plain object is not a valid default props resolver.
expectError(
  framework.testComponentFactory(MockComponent, { title: "Default title" }, undefined, undefined, {
    presetKey: "admin",
  }),
);

// Valid component props.
configuredPropsFactory({ title: "Updated title" });

// Invalid component props.
expectError(configuredPropsFactory({ title: 123 }));

// Unknown component prop.
expectError(configuredPropsFactory({ unknownProp: true }));

factory();
factory({});
factory({}, {});
factory({}, {}, {});
factory({}, {}, {}, {});

factory(
  {},
  {
    shallow: true,
  },
);

factory(
  {},
  {},
  {},
  {
    skipDefaultProps: true,
    skipDefaultSlots: true,
    skipDefaultOptions: true,
  },
);

expectError(
  factory(
    {},
    {},
    {},
    {
      unknownFlag: true,
    },
  ),
);

factory(
  {},
  {
    plugins: {
      pinia: {
        stubActions: true,
      },
    },
  },
);

/**
 * Verify withPluginInstance across configuration layers.
 */

const existingPinia = {
  install() {},
};

// Verify defaultMountOptions.
// A plain object is not a valid default mounting options resolver.
expectError(
  framework.testComponentFactory(
    MockComponent,
    undefined,
    {
      plugins: {
        pinia: {
          ...withPluginInstance(existingPinia),
        },
      },
    },
    undefined,
    { presetKey: "admin" },
  ),
);

framework.testComponentFactory(MockComponent, undefined, () => ({
  plugins: {
    pinia: {
      ...withPluginInstance(existingPinia),
    },
  },
}));

// Verify mountOptions.

factory(
  {},
  {
    plugins: {
      pinia: {
        ...withPluginInstance(existingPinia),
      },
    },
  },
);

// Verify extraOptions.

factory(
  {},
  {},
  {},
  {
    plugins: {
      pinia: {
        ...withPluginInstance(existingPinia),
      },
    },
  },
);

// Verify combining an instance with native plugin options.

factory(
  {},
  {
    plugins: {
      pinia: {
        ...withPluginInstance(existingPinia),
        stubActions: true,
      },
    },
  },
);

expectError(
  factory(
    {},
    {
      plugins: {
        pinia: 123,
      },
    },
  ),
);

/**
 * Verify Props
 */

// Verify `defaultProps`
framework.testComponentFactory(MockComponent, () => ({ title: "Example" }));
expectError(framework.testComponentFactory(MockComponent, () => ({ title1: "Example" })));
expectError(
  framework.testComponentFactory(MockComponent, () => ({
    title: 123,
  })),
);

// Verify `props`
framework.testComponentFactory(MockComponent)({ title: "Example" });
expectError(framework.testComponentFactory(MockComponent)({ title1: "Example" }));

// Verify `defaultMountOptions.props`
framework.testComponentFactory(MockComponent, undefined, () => ({ props: { title: "Example" } }));

// The resolver must reject unknown component props.
expectError(
  framework.testComponentFactory(MockComponent, undefined, () => ({
    props: { title1: "Example" },
  })),
);

// Verify `mountOptions.props`
framework.testComponentFactory(MockComponent)({}, { props: { title: "Example" } });
expectError(framework.testComponentFactory(MockComponent)({}, { props: { title1: "Example" } }));

/**
 * Verify Slots
 */

// Component with typed slots
const SlotComponent = defineComponent({
  name: "SlotComponent",
  slots: Object as SlotsType<{
    header: Record<string, never>;
    default: { user: { id: number; name: string } };
  }>,
  render: () => null,
});

// Verify `defaultSlots`
// A plain slots object is not a valid DefaultSlotsResolver.
// The fourth argument must be a function returning the slots object.
expectError(
  framework.testComponentFactory(SlotComponent, undefined, undefined, {
    header: () => "<h1>Title</h1>",
    default: () => "<div>User</div>",
  }),
);

framework.testComponentFactory(SlotComponent, undefined, undefined, () => ({
  // Normal slot accepts a function without arguments
  header: () => "<h1>Title</h1>",

  // The scoped slot automatically infers the type of the `props` argument!
  default: (props) => {
    // Verify that the type of `props.user.name` within the test is strictly defined as a string
    expectType<string>(props.user.name);
    expectType<number>(props.user.id);

    return `<div>User: ${props.user.name}</div>`;
  },
}));

// A valid DefaultSlotsResolver must reject slots absent from SlotComponent.
expectError(
  framework.testComponentFactory(SlotComponent, undefined, undefined, () => ({
    footer: () => "Footer Content",
  })),
);

// Verify `defaultMountOptions.slots`

framework.testComponentFactory(SlotComponent, undefined, () => ({
  slots: {
    header: () => "<h1>Title</h1>",

    default: (props) => {
      expectType<string>(props.user.name);
      expectType<number>(props.user.id);

      return `<div>User: ${props.user.name}</div>`;
    },
  },
}));

// The default mount options resolver must reject unknown component slots.
expectError(
  framework.testComponentFactory(SlotComponent, undefined, () => ({
    slots: {
      footer: () => "Footer Content",
    },
  })),
);

const slotFactory = framework.testComponentFactory(SlotComponent);

// Verify direct test `slots`

slotFactory(
  {},
  {},
  {
    header: () => "<h1>Title</h1>",

    default: (props) => {
      expectType<string>(props.user.name);
      expectType<number>(props.user.id);

      return `<div>User: ${props.user.name}</div>`;
    },
  },
);

expectError(
  slotFactory(
    {},
    {},
    {
      footer: () => "Footer Content",
    },
  ),
);

// Vefify `mountOptions.slots`

slotFactory(
  {},
  {
    slots: {
      header: () => "<h1>Title</h1>",

      default: (props) => {
        expectType<string>(props.user.name);
        expectType<number>(props.user.id);

        return `<div>User: ${props.user.name}</div>`;
      },
    },
  },
);

// Verification of a non-existent slot within the `mountOptions` object
expectError(
  slotFactory(
    {},
    {
      slots: {
        // Error: The `sidebar` slot does not exist in SlotComponent
        sidebar: () => "Sidebar Content",
      },
    },
  ),
);

// Verify slot parameter compatibility
expectError(
  slotFactory(
    {},
    {},
    {
      default: (props) => {
        // Error: The `user` object does not have an `age` property; TypeScript should highlight this.
        return `Age: ${props.user.age}`;
      },
    },
  ),
);

// Verify slot props inference inside the callback
expectError(
  slotFactory(
    {},
    {},
    {
      default: (props: { user: { age: number } }) => props.user,
    },
  ),
);

/**
 * Verify Data
 */

const OptionsComponent = defineComponent({
  name: "OptionsComponent",
  data() {
    return {
      counter: 0,
      status: "idle" as "idle" | "loading" | "success",
    };
  },
  render() {
    return null;
  },
});

/**
 * Baseline VTU behavior.
 *
 * TestForge intentionally preserves Vue Test Utils typing
 * and configuration semantics to simplify migration.
 */
expectError(
  mount(OptionsComponent, {
    data() {
      return {
        counter: 42,
        status: "loading",
      };
    },
  }),
);

mount(OptionsComponent, {
  data() {
    return {
      counter: 42,
      status: "loading" as const,
    };
  },
});

mount(OptionsComponent, {
  data() {
    return {
      counter: 42,
      invalidStateKey: true,
    };
  },
});

mount(OptionsComponent, {
  data() {
    return {
      status: "loading" as const,
      invalidStateKey: true,
    };
  },
});

mount(OptionsComponent, {
  data() {
    return {};
  },
});

expectError(
  mount(OptionsComponent, {
    data() {
      return {
        invalidStateKey: true,
      };
    },
  }),
);

// Verify defaultMountOptions

framework.testComponentFactory(OptionsComponent, undefined, () => ({
  data() {
    return {
      counter: 42,
      status: "loading" as const,
    };
  },
}));

framework.testComponentFactory(OptionsComponent, undefined, () => ({
  data() {
    return {
      counter: 42,
      status: "loading" as "idle" | "loading" | "success",
    };
  },
}));

framework.testComponentFactory(OptionsComponent, undefined, () => ({
  data() {
    return {
      status: "loading" as const,
      invalidStateKey: true,
    };
  },
}));

expectError(
  framework.testComponentFactory(OptionsComponent, undefined, () => ({
    data() {
      return {
        invalidStateKey: true,
      };
    },
  })),
);

// Verify mountOptions

const optionsFactory = framework.testComponentFactory(OptionsComponent);

const optionsWrapper = optionsFactory(
  {},
  {
    data() {
      return {
        counter: 42,
        status: "loading",
      };
    },
  },
);

expectType<number>(optionsWrapper.vm.counter);
expectType<"idle" | "loading" | "success">(optionsWrapper.vm.status);

// Error: Existing keys were not passed to the state
expectError(
  optionsFactory(
    {},
    {
      data() {
        return {
          invalidStateKey: true,
        };
      },
    },
  ),
);

// Error: Incorrect data type passed for an existing key
expectError(
  optionsFactory(
    {},
    {
      data() {
        return {
          counter: "forty-two" as any as string,
        };
      },
    },
  ),
);

// 3. Error: Passing a value that is not part of the union literal
expectError(
  optionsFactory(
    {},
    {
      data() {
        return {
          status: "error" as any as string,
        };
      },
    },
  ),
);
