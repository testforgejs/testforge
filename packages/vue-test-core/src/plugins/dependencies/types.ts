import type { PluginInstanceName, PluginName } from "../../types";

export interface PluginDependency<TPluginName extends PluginName = PluginName> {
  readonly pluginName: TPluginName;
  readonly dependsOn: PluginInstanceName;
}

export type PluginDependencyGraph = ReadonlyMap<PluginName, ReadonlySet<PluginInstanceName>>;
