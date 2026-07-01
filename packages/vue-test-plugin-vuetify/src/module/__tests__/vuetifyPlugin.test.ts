import { describe, it, expect } from "vitest";
import { vuetifyPlugin } from "../vuetifyPlugin.js";
import { createVuetifyPlugin } from "../createVuetifyPlugin.js";

describe("vuetifyPlugin", () => {
  it("should return 'vuetify' as plugin name when getName is called", () => {
    expect(vuetifyPlugin.getName()).toBe("vuetify");
  });

  it("should return definition containing createVuetifyPlugin when getDefinition is called", () => {
    const definition = vuetifyPlugin.getDefinition();

    expect(definition.create).toBe(createVuetifyPlugin);
  });
});
