import { expectError } from "tsd";
import { createTestFramework } from "../dist/index";
import { defineComponent } from "vue";
// Registers PluginOptionsMap test augmentation
import "./shared-plugin-types";

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

// Verify defaultProps
framework.testComponentFactory(MockComponent, { title: "Example" });
expectError(framework.testComponentFactory(MockComponent, { title1: "Example" }));
expectError(
  framework.testComponentFactory(MockComponent, {
    title: 123,
  }),
);

// Verify props
framework.testComponentFactory(MockComponent)({ title: "Example" });
expectError(framework.testComponentFactory(MockComponent)({ title1: "Example" }));

// Verify defaultMountOptions.props
framework.testComponentFactory(MockComponent, {}, { props: { title: "Example" } });
expectError(framework.testComponentFactory(MockComponent, {}, { props: { title1: "Example" } }));

// Verify mountOptions.props
framework.testComponentFactory(MockComponent)({}, { props: { title: "Example" } });
expectError(framework.testComponentFactory(MockComponent)({}, { props: { title1: "Example" } }));
