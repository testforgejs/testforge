import { expectError } from "tsd";
import { createTestFramework } from "../dist/index";
// Registers PluginOptionsMap test augmentation
import "./shared-plugin-types";

const framework = createTestFramework();

const factory = framework.testComponentFactory({});

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
