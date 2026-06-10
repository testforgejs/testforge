import { expectError, expectType } from "tsd";
import { createTestFramework } from "../dist/index";
import { defineComponent } from "vue";
import { mount } from "@vue/test-utils";
// Registers PluginOptionsMap test augmentation
import "./shared-plugin-types";

import type { SlotsType } from "vue";

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

const framework = createTestFramework();

const factory = framework.testComponentFactory(MockComponent);

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
framework.testComponentFactory(MockComponent, { title: "Example" });
expectError(framework.testComponentFactory(MockComponent, { title1: "Example" }));
expectError(
  framework.testComponentFactory(MockComponent, {
    title: 123,
  }),
);

// Verify `props`
framework.testComponentFactory(MockComponent)({ title: "Example" });
expectError(framework.testComponentFactory(MockComponent)({ title1: "Example" }));

// Verify `defaultMountOptions.props`
framework.testComponentFactory(MockComponent, {}, { props: { title: "Example" } });
expectError(framework.testComponentFactory(MockComponent, {}, { props: { title1: "Example" } }));

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

framework.testComponentFactory(
  SlotComponent,
  {},
  {},
  {
    // Normal slot accepts a function without arguments
    header: () => "<h1>Title</h1>",

    // The scoped slot automatically infers the type of the `props` argument!
    default: (props) => {
      // Verify that the type of `props.user.name` within the test is strictly defined as a string
      expectType<string>(props.user.name);
      expectType<number>(props.user.id);

      return `<div>User: ${props.user.name}</div>`;
    },
  },
);

// Verification of a non-existent slot within the `defaultSlots` object
expectError(
  framework.testComponentFactory(
    SlotComponent,
    {},
    {},
    {
      footer: () => "Footer Content",
    },
  ),
);

// Verify `defaultMountOptions.slots`

framework.testComponentFactory(
  SlotComponent,
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

// Verification of a non-existent slot within the `defaultMountOptions` object
expectError(
  framework.testComponentFactory(
    SlotComponent,
    {},
    {
      slots: {
        footer: () => "Footer Content",
      },
    },
  ),
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

framework.testComponentFactory(
  OptionsComponent,
  {},
  {
    data() {
      return {
        counter: 42,
        status: "loading" as const,
      };
    },
  },
);

framework.testComponentFactory(
  OptionsComponent,
  {},
  {
    data() {
      return {
        counter: 42,
        status: "loading" as "idle" | "loading" | "success",
      };
    },
  },
);

framework.testComponentFactory(
  OptionsComponent,
  {},
  {
    data() {
      return {
        status: "loading" as const,
        invalidStateKey: true,
      };
    },
  },
);

expectError(
  framework.testComponentFactory(
    OptionsComponent,
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
