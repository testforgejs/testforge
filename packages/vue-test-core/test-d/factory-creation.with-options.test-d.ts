import { expectType, expectError } from "tsd";
import { defineComponent } from "vue";

import type { SlotsType } from "vue";
import type { ComponentFactory, ComponentFactoryCreator } from "../dist/index.js";

declare const testComponentFactory: ComponentFactoryCreator;

const AppAlert = defineComponent({
  props: {
    visible: {
      type: Boolean,
      required: true,
    },
    message: String,
  },

  render() {
    return null;
  },
});

const SlotComponent = defineComponent({
  slots: Object as SlotsType<{
    header: Record<string, never>;
    default: { user: { id: number; name: string } };
  }>,
  render: () => null,
});

// 1. Component type is inferred from options.component.

// A configuration object is not a factory options resolver.
expectError(
  testComponentFactory.withOptions({
    component: AppAlert,
    presetKey: "admin",
    defaultProps: {
      visible: true,
      message: "Hello",
    },
  }),
);

const factory = testComponentFactory.withOptions(() => ({
  component: AppAlert,
  presetKey: "admin",
  defaultProps: {
    visible: true,
    message: "Hello",
  },
}));

expectType<ComponentFactory<typeof AppAlert>>(factory);

// 2. Default props are checked against component props.

expectError(
  testComponentFactory.withOptions(() => ({
    component: AppAlert,
    defaultProps: {
      visible: "yes",
    },
  })),
);

// 3. Extra props are rejected even when valid props are also present.

expectError(
  testComponentFactory.withOptions(() => ({
    component: AppAlert,
    defaultProps: {
      visible: true,
      unknownProperty: true,
    },
  })),
);

// 4. The returned factory preserves component props typing.

factory({
  visible: false,
  message: "Updated",
});

expectError(
  factory({
    visible: "yes",
  }),
);

// 5. Preset key must be a string.

expectError(
  testComponentFactory.withOptions(() => ({
    component: AppAlert,
    presetKey: 123,
  })),
);

// 6. Unknown factory creation options (including the legacy preset key) are rejected.

expectError(
  testComponentFactory.withOptions(() => ({
    component: AppAlert,
    preset: "admin",
  })),
);

expectError(
  testComponentFactory.withOptions(() => ({
    component: AppAlert,
    presetKey: "admin",
    unknownOption: true,
  })),
);

// 7. Only component is required.

const minimalFactory = testComponentFactory.withOptions(() => ({
  component: AppAlert,
}));

expectType<ComponentFactory<typeof AppAlert>>(minimalFactory);

// 8. Default mount options are supported and validated.

const factoryWithMountOptions = testComponentFactory.withOptions(() => ({
  component: AppAlert,
  defaultMountOptions: {
    shallow: true,
    global: {
      stubs: {
        AppButton: true,
      },
    },
  },
}));

expectType<ComponentFactory<typeof AppAlert>>(factoryWithMountOptions);

// Invalid mount option value.
expectError(
  testComponentFactory.withOptions(() => ({
    component: AppAlert,
    defaultMountOptions: {
      shallow: "yes",
    },
  })),
);

// Unknown mount option next to a valid option.
expectError(
  testComponentFactory.withOptions(() => ({
    component: AppAlert,
    defaultMountOptions: {
      shallow: true,
      unknownOption: true,
    },
  })),
);

// Unknown component prop inside defaultMountOptions.props.
expectError(
  testComponentFactory.withOptions(() => ({
    component: AppAlert,
    defaultMountOptions: {
      props: {
        visible: true,
        unknownProperty: true,
      },
    },
  })),
);

// 9. Typed default slots are supported and checked.

const factoryWithSlots = testComponentFactory.withOptions(() => ({
  component: SlotComponent,
  defaultSlots: {
    header: () => "<h1>Alert</h1>",
    default: (props) => {
      expectType<string>(props.user.name);
      expectType<number>(props.user.id);
      return `Alert for ${props.user.name}`;
    },
  },
}));

expectType<ComponentFactory<typeof SlotComponent>>(factoryWithSlots);

// String values are not valid scoped slot functions.
expectError(
  testComponentFactory.withOptions(() => ({
    component: SlotComponent,
    defaultSlots: {
      default: "Alert content",
    },
  })),
);

// Unknown slot next to a valid, declared slot.
expectError(
  testComponentFactory.withOptions(() => ({
    component: SlotComponent,
    defaultSlots: {
      header: () => "<h1>Alert</h1>",
      footer: () => "Footer content",
    },
  })),
);

// Unknown slot inside defaultMountOptions.slots.
expectError(
  testComponentFactory.withOptions(() => ({
    component: SlotComponent,
    defaultMountOptions: {
      slots: {
        header: () => "<h1>Alert</h1>",
        footer: () => "Footer content",
      },
    },
  })),
);

// 10. All factory creation options can be combined.

const fullyConfiguredFactory = testComponentFactory.withOptions(() => ({
  component: AppAlert,
  presetKey: "admin",
  defaultProps: {
    visible: true,
    message: "Hello",
  },
  defaultMountOptions: {
    shallow: true,
    global: {
      stubs: {
        AppButton: true,
      },
    },
  },
  defaultSlots: {
    default: () => "Alert content",
  },
}));

expectType<ComponentFactory<typeof AppAlert>>(fullyConfiguredFactory);

// 11. A valid Vue component is required.

expectError(
  testComponentFactory.withOptions(() => ({
    presetKey: "admin",
  })),
);

expectError(
  testComponentFactory.withOptions(() => ({
    component: 123,
  })),
);
