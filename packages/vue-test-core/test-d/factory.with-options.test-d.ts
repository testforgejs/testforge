import { expectType, expectError } from "tsd";
import { defineComponent } from "vue";

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

// 1. Component type is inferred from options.component.

const factory = testComponentFactory.withOptions({
  component: AppAlert,
  presetKey: "admin",

  defaultProps: {
    visible: true,
    message: "Hello",
  },
});

expectType<ComponentFactory<typeof AppAlert>>(factory);

// 2. Default props are checked against component props.

expectError(
  testComponentFactory.withOptions({
    component: AppAlert,

    defaultProps: {
      visible: "yes",
    },
  }),
);

// 3. Unknown props are rejected.

expectError(
  testComponentFactory.withOptions({
    component: AppAlert,

    defaultProps: {
      unknownProperty: true,
    },
  }),
);

// 4. Returned factory preserves component props typing.

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
  testComponentFactory.withOptions({
    component: AppAlert,
    presetKey: 123,
  }),
);

// 6. The old preset selector is not supported.

expectError(
  testComponentFactory.withOptions({
    component: AppAlert,
    preset: "admin",
  }),
);

// 7. Only component is required.

const minimalFactory = testComponentFactory.withOptions({
  component: AppAlert,
});

expectType<ComponentFactory<typeof AppAlert>>(minimalFactory);

// 8. Default mount options are supported.

const factoryWithMountOptions = testComponentFactory.withOptions({
  component: AppAlert,

  defaultMountOptions: {
    shallow: true,
    global: {
      stubs: {
        AppButton: true,
      },
    },
  },
});

expectType<ComponentFactory<typeof AppAlert>>(factoryWithMountOptions);

// Invalid mount options are rejected.

expectError(
  testComponentFactory.withOptions({
    component: AppAlert,

    defaultMountOptions: {
      shallow: "yes",
    },
  }),
);

// 9. Default slots are supported.

const factoryWithSlots = testComponentFactory.withOptions({
  component: AppAlert,

  defaultSlots: {
    default: () => "Alert content",
  },
});

expectType<ComponentFactory<typeof AppAlert>>(factoryWithSlots);

// 10. All factory creation options can be combined.

const fullyConfiguredFactory = testComponentFactory.withOptions({
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
});

expectType<ComponentFactory<typeof AppAlert>>(fullyConfiguredFactory);

// String values are not accepted as default slots.

expectError(
  testComponentFactory.withOptions({
    component: AppAlert,

    defaultSlots: {
      default: "Alert content",
    },
  }),
);

// 11. A valid Vue component is required.

expectError(
  testComponentFactory.withOptions({
    presetKey: "admin",
  }),
);

expectError(
  testComponentFactory.withOptions({
    component: 123,
  }),
);
