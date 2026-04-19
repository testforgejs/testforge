import { exposeInstance } from "../helpers/exposeInstance.js";

export function createPluginInstance(factory, options) {
  const instance = options.__sharedInstance || factory(options);
  exposeInstance(instance, options);

  return instance;
}
