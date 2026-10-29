export interface TestDependencyAInstance {
  value: string;
}

export interface TestDependencyBInstance {
  count: number;
}

export interface TestDependencyCInstance {
  enabled: boolean;
}

export interface TestInactiveDependencyInstance {
  active: boolean;
}

declare module "../../../../types.js" {
  interface PluginOptionsMap {
    sourcePlugin: object;
    dependencyA: object;
    dependencyB: object;
    dependencyC: object;
    inactiveDependency: object;
  }

  interface PluginInstanceMap {
    dependencyA: TestDependencyAInstance;
    dependencyB: TestDependencyBInstance;
    dependencyC: TestDependencyCInstance;
    inactiveDependency: TestInactiveDependencyInstance;
  }
}
