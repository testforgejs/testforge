---
"@testforgejs/vue-test-core": minor
---

feat: add `extendPreset` for creating project-specific presets from existing preset definitions.

Preset extensions can override plugin configuration and manifest entries while preserving the base preset configuration. Extension validation also ensures that newly added plugins declare both their `enabled` state and default configuration, and prevents invalid or unknown plugin defaults.
