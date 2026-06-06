// @vitest-environment jsdom

import { beforeEach, describe, expect, it } from "vitest";
import { h } from "vue";

import { createTestFramework } from "../dist/index.js";

describe("createTestFramework smoke", () => {
  let testComponentFactory;

  beforeEach(() => {
    const framework = createTestFramework();
    testComponentFactory = framework.testComponentFactory;
  });

  it("should mount component", () => {
    const Component = {
      render() {
        return h("div", "Hello smoke test");
      },
    };

    const wrapper = testComponentFactory(Component)();

    expect(wrapper.text()).toBe("Hello smoke test");
  });

  describe("props", () => {
    const Component = {
      props: {
        msg: String,
      },

      setup(props) {
        return () => h("h1", props.msg);
      },
    };

    it("should pass direct props", () => {
      const factory = testComponentFactory(Component);

      const wrapper = factory({
        msg: "Direct prop",
      });

      expect(wrapper.find("h1").text()).toBe("Direct prop");
    });

    it("should use default props", () => {
      const factory = testComponentFactory(Component, {
        msg: "Default prop",
      });

      const wrapper = factory();

      expect(wrapper.find("h1").text()).toBe("Default prop");
    });

    it("should prioritize direct props over default props", () => {
      const factory = testComponentFactory(Component, {
        msg: "Default prop",
      });

      const wrapper = factory({
        msg: "Direct prop",
      });

      expect(wrapper.find("h1").text()).toBe("Direct prop");
    });
  });

  describe("slots", () => {
    const Component = {
      setup(props, { slots }) {
        return () =>
          h("div", [h("header", slots.header?.() ?? []), h("main", slots.default?.() ?? [])]);
      },
    };

    it("should pass direct slots", () => {
      const factory = testComponentFactory(Component);

      const wrapper = factory(
        {},
        {},
        {
          default: "Main content",
          header: "<h1>Header</h1>",
        },
      );

      expect(wrapper.find("main").text()).toBe("Main content");
      expect(wrapper.find("header h1").text()).toBe("Header");
    });

    it("should use default slots", () => {
      const factory = testComponentFactory(
        Component,
        {},
        {},
        {
          default: "Main content",
          header: "<h1>Header</h1>",
        },
      );

      const wrapper = factory();

      expect(wrapper.find("main").text()).toBe("Main content");
      expect(wrapper.find("header h1").text()).toBe("Header");
    });

    it("should prioritize direct slots over default slots", () => {
      const factory = testComponentFactory(
        Component,
        {},
        {},
        {
          default: "Default content",
          header: "<h1>Default Header</h1>",
        },
      );

      const wrapper = factory(
        {},
        {},
        {
          default: "Direct content",
          header: "<h1>Direct Header</h1>",
        },
      );

      expect(wrapper.find("main").text()).toBe("Direct content");
      expect(wrapper.find("header h1").text()).toBe("Direct Header");
    });
  });
});
