---
"@testforgejs/vue-test-core": minor
---

feat: add typed slot support for component factories

Slot names and scoped slot props are now inferred from the
component type.

Unlike Vue's native `Slot` type, TestForge intentionally
relaxes slot return types to make test doubles easier to
write. Simple string-based slot mocks are supported while
preserving type safety for scoped slot props and rejecting
unknown slot names.

Added type-level coverage for all slot entry points,
including factory defaults, mount options and per-test
overrides.
