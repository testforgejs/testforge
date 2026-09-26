import { describe, it, expect } from "vitest";
import { routerPlugin } from "../routerPlugin.js";
import { createRouterPlugin } from "../createRouterPlugin.js";

describe("routerPlugin", () => {
  it("should return 'router' as plugin name when getName is called", () => {
    expect(routerPlugin.getName()).toBe("router");
  });

  it("should return definition containing createRouterPlugin when getDefinition is called", () => {
    const definition = routerPlugin.getDefinition();

    expect(definition.create).toBe(createRouterPlugin);
  });

  it("should provide default Router options", () => {
    const options = routerPlugin.getDefaultOptions()();

    expect(options.history).toBeDefined();
    expect(options.routes).toEqual([]);
  });

  it("should create functional Router instance using default options", async () => {
    const options = routerPlugin.getDefaultOptions()();

    const definition = routerPlugin.getDefinition();
    const router = definition.create(options);

    router.addRoute({
      path: "/test",
      component: { render: () => null },
    });

    await router.push("/test");
    await router.isReady();

    expect(router.currentRoute.value.path).toBe("/test");
    expect(router.resolve("/test").matched).toHaveLength(1);
  });
});
