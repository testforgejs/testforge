import { expectAssignable, expectError, expectType } from "tsd";
import { defineComponent } from "vue";
import type { SlotsType } from "vue";

import { createTestFramework } from "../dist/index.js";
import type { ComponentFactory, ComponentFactoryInvocationOptions } from "../dist/index.js";

// Register plugin option types for the managed-plugin checks below.
import "./shared-plugin-types.js";

const PropsComponent = defineComponent({
  name: "PropsComponent",
  props: {
    title: { type: String, required: true },
    count: Number,
  },
  render: () => null,
});

const { testComponentFactory } = createTestFramework();

/**
 * Public invocation options type.
 * The component type is fixed by the factory, so props remain optional
 * even when the Vue component declares a required prop.
 */

type PropsInvocationOptions = ComponentFactoryInvocationOptions<typeof PropsComponent>;

expectAssignable<PropsInvocationOptions>({});
expectAssignable<PropsInvocationOptions>({ props: { title: "Hello" } });
expectAssignable<PropsInvocationOptions>({
  props: { title: "Hello", count: 2 },
  mountOptions: { shallow: true, props: { count: 3 } },
  slots: {},
  extraOptions: { presetKey: "custom", skipDefaultProps: true },
});

/** Both factory creation forms expose the same typed invocation API. */

const positionalFactory = testComponentFactory(PropsComponent);
const objectFactory = testComponentFactory.withOptions({ component: PropsComponent });

expectType<ComponentFactory<typeof PropsComponent>>(positionalFactory);
expectType<ComponentFactory<typeof PropsComponent>>(objectFactory);

positionalFactory();
positionalFactory.withOptions({});
objectFactory.withOptions({});

positionalFactory.withOptions({ props: { title: "Hello", count: 2 } });
objectFactory.withOptions({ props: { title: "Hello", count: 2 } });

// Both invocation forms retain exactly the same Vue Test Utils wrapper type.
const objectWrapper = positionalFactory.withOptions({
  props: {
    title: "Hello",
  },
});

expectType<ReturnType<typeof positionalFactory>>(objectWrapper);
expectType<ReturnType<typeof positionalFactory>>(
  objectFactory.withOptions({ props: { title: "Hello" } }),
);

/** Correct correspondence between named and positional arguments. */

positionalFactory.withOptions({
  props: { title: "Per-test", count: 2 },
  mountOptions: { shallow: true, props: { count: 3 } },
  slots: {},
  extraOptions: {
    presetKey: "custom",
    skipDefaultProps: true,
    skipDefaultSlots: true,
    skipDefaultOptions: true,
  },
});

// The fourth positional argument can be provided independently.
positionalFactory.withOptions({
  extraOptions: { skipDefaultProps: true },
});

// Unlike factory(), the object API requires one options argument.
expectError(positionalFactory.withOptions());

// Factory creation options and mount invocation options must not be confused.
expectError(positionalFactory.withOptions({ component: PropsComponent }));
expectError(positionalFactory.withOptions({ defaultProps: { title: "Hello" } }));
expectError(positionalFactory.withOptions({ presetKey: "custom" }));
expectError(positionalFactory.withOptions({ extraOption: {} }));

/** Strict component props (both direct props and mountOptions.props). */

expectError(positionalFactory.withOptions({ props: { title: 123 } }));
expectError(positionalFactory.withOptions({ props: { unknownProp: true } }));
expectError(positionalFactory.withOptions({ mountOptions: { props: { count: "two" } } }));
expectError(positionalFactory.withOptions({ mountOptions: { props: { unknownProp: true } } }));

/** Type-safe VTU and TestForge configuration. */

positionalFactory.withOptions({ mountOptions: { shallow: false } });
positionalFactory.withOptions({ mountOptions: { skipManagedPlugins: true } });
positionalFactory.withOptions({ extraOptions: { skipDefaultOptions: true } });

expectError(positionalFactory.withOptions({ mountOptions: { shallow: "true" } }));
expectError(positionalFactory.withOptions({ extraOptions: { skipDefaultProps: "true" } }));
expectError(positionalFactory.withOptions({ extraOptions: { unknownFlag: true } }));

// The two plugin configuration layers remain distinct and typed.
positionalFactory.withOptions({
  mountOptions: { plugins: { pinia: { stubActions: true } } },
  extraOptions: { plugins: { pinia: { stubActions: false } } },
});

expectError(
  positionalFactory.withOptions({
    mountOptions: { plugins: { pinia: 123 } },
  }),
);

/** Slot names and scoped slot props remain inferred from the component. */

const SlotsComponent = defineComponent({
  name: "SlotsComponent",
  slots: Object as SlotsType<{
    header: Record<string, never>;
    default: { user: { id: number; name: string } };
  }>,
  render: () => null,
});

const slotFactory = testComponentFactory(SlotsComponent);

slotFactory.withOptions({
  slots: {
    header: () => "Header",
    default: (props) => {
      expectType<number>(props.user.id);
      expectType<string>(props.user.name);
      return props.user.name;
    },
  },
});

slotFactory.withOptions({
  mountOptions: {
    slots: {
      default: (props) => {
        expectType<number>(props.user.id);
        return props.user.name;
      },
    },
  },
});

expectError(slotFactory.withOptions({ slots: { sidebar: () => "Unknown" } }));
expectError(slotFactory.withOptions({ mountOptions: { slots: { sidebar: () => "Unknown" } } }));
expectError(
  slotFactory.withOptions({
    slots: { default: (props: { user: { age: number } }) => props.user.age },
  }),
);

/** Component data is checked through mountOptions.data. */

const DataComponent = defineComponent({
  name: "DataComponent",
  data() {
    return {
      counter: 0,
      status: "idle" as "idle" | "loading" | "success",
    };
  },
  render: () => null,
});

const dataFactory = testComponentFactory(DataComponent);
const dataWrapper = dataFactory.withOptions({
  mountOptions: {
    data() {
      return { counter: 42, status: "loading" as const };
    },
  },
});

expectType<number>(dataWrapper.vm.counter);
expectType<"idle" | "loading" | "success">(dataWrapper.vm.status);

expectError(
  dataFactory.withOptions({
    mountOptions: { data: () => ({ counter: "forty-two" }) },
  }),
);
expectError(
  dataFactory.withOptions({
    mountOptions: { data: () => ({ unknownState: true }) },
  }),
);
