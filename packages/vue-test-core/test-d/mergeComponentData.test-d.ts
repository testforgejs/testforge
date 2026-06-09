import { expectType, expectError } from "tsd";
import { mergeComponentData } from "../src/utils/mergeComponentData.js";

// Emulate the strict interface of the component's properties
interface ComponentProps {
  title: string;
  count?: number;
  theme: "light" | "dark";
}

// 1. Ideal scenario: all layers contain valid ComponentProps
const defaultMountData: Partial<ComponentProps> = { theme: "light" } as const; // Fix the literal “light”
const defaultData: Partial<ComponentProps> = { title: "Hello" };
const mountData: Partial<ComponentProps> = { count: 10 };
const directData: Partial<ComponentProps> = { theme: "dark" };

const result = mergeComponentData({
  defaultMountData,
  defaultData,
  mountData,
  directData,
});

expectType<Partial<ComponentProps>>(result);

// Verify that the result retains the strict ComponentProps type
// The result should be an object whose properties are fully valid for ComponentProps
expectType<{
  title?: string;
  count?: number;
  theme?: "light" | "dark";
}>(result);

// 2. Checking for null and undefined
const resultWithNull = mergeComponentData<Partial<ComponentProps>>({
  defaultMountData: null,
  defaultData: undefined,
  mountData: { title: "Valid Title" },
  directData: null,
});

expectType<Partial<ComponentProps>>(resultWithNull);

// 3. Passing a property of the wrong type (number instead of string)
expectError(
  mergeComponentData<Partial<ComponentProps>>({
    defaultData: { title: "Correct" },
    // Error: `count` must be a number, not a string
    directData: { count: "not-a-number" as any as string },
  }),
);

// 4. Passing a property that is completely unrelated and not defined in the interface
expectError(
  mergeComponentData<ComponentProps>({
    // Error: The `invalidProperty` property does not exist in ComponentProps
    mountData: { invalidProperty: true },
  }),
);

// 5. Attempt to pass a non-object as data (restriction on `extends object`)
expectError(
  // The string does not satisfy the `object` constraint
  mergeComponentData({
    defaultData: "not-an-object",
  }),
);
