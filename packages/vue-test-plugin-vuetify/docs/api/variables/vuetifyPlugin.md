[**@testforge/vue-test-plugin-vuetify**](../README.md)

***

> `const` **vuetifyPlugin**: `PluginModule`\<[`VuetifyInstance`](../type-aliases/VuetifyInstance.md), [`VueTestVuetifyOptions`](../interfaces/VueTestVuetifyOptions.md)\>

Defined in: packages/vue-test-plugin-vuetify/src/module/vuetifyPlugin.ts:19

Official TestForge integration for Vuetify.

Registers the `vuetify` plugin key in the TestForge plugin registry
and provides a factory for creating Vuetify runtime instances during
component mounting.

This plugin belongs to the
**Stateful Plugin Factory** category because Vuetify exposes
a runtime instance through createVuetify.

## See

createVuetifyPlugin
