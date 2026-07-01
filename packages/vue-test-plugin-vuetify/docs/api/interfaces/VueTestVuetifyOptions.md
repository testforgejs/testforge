[**@testforge/vue-test-plugin-vuetify**](../README.md)

***

Defined in: packages/vue-test-plugin-vuetify/src/types/types.ts:28

Configuration options for the Vuetify test plugin.

This interface combines standard Vuetify initialization settings
with TestForge plugin control options such as `expose()`.

## See

 - VuetifyOptions from the `vuetify` package for theme,
icon, component and directive configuration.
 - PluginControlOptions from `@testforge/vue-test-core`
for instance interception and testing helpers.

## Extends

- `VuetifyOptions`.`PluginControlOptions`\<[`VuetifyInstance`](../type-aliases/VuetifyInstance.md)\>

## Properties

### aliases?

> `optional` **aliases?**: `Record`\<`string`, `any`\>

Defined in: node\_modules/.pnpm/vuetify@4.1.2\_typescript@6.0.3\_vue@3.5.32\_typescript@6.0.3\_/node\_modules/vuetify/lib/framework.d.ts:2779

#### Inherited from

`VuetifyOptions.aliases`

***

### blueprint?

> `optional` **blueprint?**: `Blueprint`

Defined in: node\_modules/.pnpm/vuetify@4.1.2\_typescript@6.0.3\_vue@3.5.32\_typescript@6.0.3\_/node\_modules/vuetify/lib/framework.d.ts:2780

#### Inherited from

`VuetifyOptions.blueprint`

***

### components?

> `optional` **components?**: `Record`\<`string`, `any`\>

Defined in: node\_modules/.pnpm/vuetify@4.1.2\_typescript@6.0.3\_vue@3.5.32\_typescript@6.0.3\_/node\_modules/vuetify/lib/framework.d.ts:2781

#### Inherited from

`VuetifyOptions.components`

***

### date?

> `optional` **date?**: `Partial`\<`InternalDateOptions`\>

Defined in: node\_modules/.pnpm/vuetify@4.1.2\_typescript@6.0.3\_vue@3.5.32\_typescript@6.0.3\_/node\_modules/vuetify/lib/framework.d.ts:2782

#### Inherited from

`VuetifyOptions.date`

***

### defaults?

> `optional` **defaults?**: `DefaultsOptions`

Defined in: node\_modules/.pnpm/vuetify@4.1.2\_typescript@6.0.3\_vue@3.5.32\_typescript@6.0.3\_/node\_modules/vuetify/lib/framework.d.ts:2784

#### Inherited from

`VuetifyOptions.defaults`

***

### directives?

> `optional` **directives?**: `Record`\<`string`, `any`\>

Defined in: node\_modules/.pnpm/vuetify@4.1.2\_typescript@6.0.3\_vue@3.5.32\_typescript@6.0.3\_/node\_modules/vuetify/lib/framework.d.ts:2783

#### Inherited from

`VuetifyOptions.directives`

***

### display?

> `optional` **display?**: `DisplayOptions`

Defined in: node\_modules/.pnpm/vuetify@4.1.2\_typescript@6.0.3\_vue@3.5.32\_typescript@6.0.3\_/node\_modules/vuetify/lib/framework.d.ts:2785

#### Inherited from

`VuetifyOptions.display`

***

### expose?

> `optional` **expose?**: (`instance`) => `void`

Defined in: packages/vue-test-core/src/types.ts:140

#### Parameters

##### instance

###### date

\{ `instance`: \{ `addDays`: (`date`, `amount`) => `unknown`; `addHours`: (`date`, `amount`) => `unknown`; `addMinutes`: (`date`, `amount`) => `unknown`; `addMonths`: (`date`, `amount`) => `unknown`; `addWeeks`: (`date`, `amount`) => `unknown`; `date`: (`value?`) => `unknown`; `endOfDay`: (`date`) => `unknown`; `endOfMonth`: (`date`) => `unknown`; `endOfWeek`: (`date`) => `unknown`; `endOfYear`: (`date`) => `unknown`; `format`: (`date`, `formatString`) => `string`; `getDate`: (`date`) => `number`; `getDiff`: (`date`, `comparing`, `unit?`) => `number`; `getHours`: (`date`) => `number`; `getMinutes`: (`date`) => `number`; `getMonth`: (`date`) => `number`; `getNextMonth`: (`date`) => `unknown`; `getPreviousMonth`: (`date`) => `unknown`; `getWeek`: (`date`, `firstDayOfWeek?`, `firstDayOfYear?`) => `number`; `getWeekArray`: (`date`, `firstDayOfWeek?`) => `unknown`[][]; `getWeekdays`: (`firstDayOfWeek?`, `weekdayFormat?`) => `string`[]; `getYear`: (`date`) => `number`; `isAfter`: (`date`, `comparing`) => `boolean`; `isAfterDay`: (`date`, `comparing`) => `boolean`; `isBefore`: (`date`, `comparing`) => `boolean`; `isEqual`: (`date`, `comparing`) => `boolean`; `isSameDay`: (`date`, `comparing`) => `boolean`; `isSameMonth`: (`date`, `comparing`) => `boolean`; `isSameYear`: (`date`, `comparing`) => `boolean`; `isValid`: (`date`) => `boolean`; `isWithinRange`: (`date`, `range`) => `boolean`; `locale?`: `any`; `parseISO`: (`date`) => `unknown`; `setDate`: (`date`, `day`) => `unknown`; `setHours`: (`date`, `hours`) => `unknown`; `setMinutes`: (`date`, `minutes`) => `unknown`; `setMonth`: (`date`, `month`) => `unknown`; `setYear`: (`date`, `year`) => `unknown`; `startOfDay`: (`date`) => `unknown`; `startOfMonth`: (`date`) => `unknown`; `startOfWeek`: (`date`, `firstDayOfWeek?`) => `unknown`; `startOfYear`: (`date`) => `unknown`; `toISO`: (`date`) => `string`; `toJsDate`: (`value`) => `Date`; \}; `options`: `InternalDateOptions`; \}

###### date.instance

\{ `addDays`: (`date`, `amount`) => `unknown`; `addHours`: (`date`, `amount`) => `unknown`; `addMinutes`: (`date`, `amount`) => `unknown`; `addMonths`: (`date`, `amount`) => `unknown`; `addWeeks`: (`date`, `amount`) => `unknown`; `date`: (`value?`) => `unknown`; `endOfDay`: (`date`) => `unknown`; `endOfMonth`: (`date`) => `unknown`; `endOfWeek`: (`date`) => `unknown`; `endOfYear`: (`date`) => `unknown`; `format`: (`date`, `formatString`) => `string`; `getDate`: (`date`) => `number`; `getDiff`: (`date`, `comparing`, `unit?`) => `number`; `getHours`: (`date`) => `number`; `getMinutes`: (`date`) => `number`; `getMonth`: (`date`) => `number`; `getNextMonth`: (`date`) => `unknown`; `getPreviousMonth`: (`date`) => `unknown`; `getWeek`: (`date`, `firstDayOfWeek?`, `firstDayOfYear?`) => `number`; `getWeekArray`: (`date`, `firstDayOfWeek?`) => `unknown`[][]; `getWeekdays`: (`firstDayOfWeek?`, `weekdayFormat?`) => `string`[]; `getYear`: (`date`) => `number`; `isAfter`: (`date`, `comparing`) => `boolean`; `isAfterDay`: (`date`, `comparing`) => `boolean`; `isBefore`: (`date`, `comparing`) => `boolean`; `isEqual`: (`date`, `comparing`) => `boolean`; `isSameDay`: (`date`, `comparing`) => `boolean`; `isSameMonth`: (`date`, `comparing`) => `boolean`; `isSameYear`: (`date`, `comparing`) => `boolean`; `isValid`: (`date`) => `boolean`; `isWithinRange`: (`date`, `range`) => `boolean`; `locale?`: `any`; `parseISO`: (`date`) => `unknown`; `setDate`: (`date`, `day`) => `unknown`; `setHours`: (`date`, `hours`) => `unknown`; `setMinutes`: (`date`, `minutes`) => `unknown`; `setMonth`: (`date`, `month`) => `unknown`; `setYear`: (`date`, `year`) => `unknown`; `startOfDay`: (`date`) => `unknown`; `startOfMonth`: (`date`) => `unknown`; `startOfWeek`: (`date`, `firstDayOfWeek?`) => `unknown`; `startOfYear`: (`date`) => `unknown`; `toISO`: (`date`) => `string`; `toJsDate`: (`value`) => `Date`; \}

###### date.instance.addDays

(`date`, `amount`) => `unknown`

###### date.instance.addHours

(`date`, `amount`) => `unknown`

###### date.instance.addMinutes

(`date`, `amount`) => `unknown`

###### date.instance.addMonths

(`date`, `amount`) => `unknown`

###### date.instance.addWeeks

(`date`, `amount`) => `unknown`

###### date.instance.date

(`value?`) => `unknown`

###### date.instance.endOfDay

(`date`) => `unknown`

###### date.instance.endOfMonth

(`date`) => `unknown`

###### date.instance.endOfWeek

(`date`) => `unknown`

###### date.instance.endOfYear

(`date`) => `unknown`

###### date.instance.format

(`date`, `formatString`) => `string`

###### date.instance.getDate

(`date`) => `number`

###### date.instance.getDiff

(`date`, `comparing`, `unit?`) => `number`

###### date.instance.getHours

(`date`) => `number`

###### date.instance.getMinutes

(`date`) => `number`

###### date.instance.getMonth

(`date`) => `number`

###### date.instance.getNextMonth

(`date`) => `unknown`

###### date.instance.getPreviousMonth

(`date`) => `unknown`

###### date.instance.getWeek

(`date`, `firstDayOfWeek?`, `firstDayOfYear?`) => `number`

###### date.instance.getWeekArray

(`date`, `firstDayOfWeek?`) => `unknown`[][]

###### date.instance.getWeekdays

(`firstDayOfWeek?`, `weekdayFormat?`) => `string`[]

###### date.instance.getYear

(`date`) => `number`

###### date.instance.isAfter

(`date`, `comparing`) => `boolean`

###### date.instance.isAfterDay

(`date`, `comparing`) => `boolean`

###### date.instance.isBefore

(`date`, `comparing`) => `boolean`

###### date.instance.isEqual

(`date`, `comparing`) => `boolean`

###### date.instance.isSameDay

(`date`, `comparing`) => `boolean`

###### date.instance.isSameMonth

(`date`, `comparing`) => `boolean`

###### date.instance.isSameYear

(`date`, `comparing`) => `boolean`

###### date.instance.isValid

(`date`) => `boolean`

###### date.instance.isWithinRange

(`date`, `range`) => `boolean`

###### date.instance.locale?

`any`

###### date.instance.parseISO

(`date`) => `unknown`

###### date.instance.setDate

(`date`, `day`) => `unknown`

###### date.instance.setHours

(`date`, `hours`) => `unknown`

###### date.instance.setMinutes

(`date`, `minutes`) => `unknown`

###### date.instance.setMonth

(`date`, `month`) => `unknown`

###### date.instance.setYear

(`date`, `year`) => `unknown`

###### date.instance.startOfDay

(`date`) => `unknown`

###### date.instance.startOfMonth

(`date`) => `unknown`

###### date.instance.startOfWeek

(`date`, `firstDayOfWeek?`) => `unknown`

###### date.instance.startOfYear

(`date`) => `unknown`

###### date.instance.toISO

(`date`) => `string`

###### date.instance.toJsDate

(`value`) => `Date`

###### date.options

`InternalDateOptions`

###### defaults

`Ref`\<`DefaultsInstance`, `DefaultsInstance`\>

###### display

`DisplayInstance`

###### goTo

`GoToInstance`

###### icons

`InternalIconOptions`

###### install

(`app`) => `void`

###### locale

\{ `current`: `Ref`\<`string`, `string`\>; `decimalSeparator`: `ShallowRef`\<`string`\>; `fallback`: `Ref`\<`string`, `string`\>; `isRtl`: `Ref`\<`boolean`, `boolean`\>; `messages`: `Ref`\<`LocaleMessages`, `LocaleMessages`\>; `n`: (`value`) => `string`; `name`: `string`; `numericGroupSeparator`: `ShallowRef`\<`string`\>; `provide`: (`props`) => `LocaleInstance`; `rtl`: `Ref`\<`Record`\<`string`, `boolean`\>, `Record`\<`string`, `boolean`\>\>; `rtlClasses`: `Ref`\<`string`, `string`\>; `t`: (`key`, ...`params`) => `string`; \}

###### locale.current

`Ref`\<`string`, `string`\>

###### locale.decimalSeparator

`ShallowRef`\<`string`\>

###### locale.fallback

`Ref`\<`string`, `string`\>

###### locale.isRtl

`Ref`\<`boolean`, `boolean`\>

###### locale.messages

`Ref`\<`LocaleMessages`, `LocaleMessages`\>

###### locale.n

(`value`) => `string`

###### locale.name

`string`

###### locale.numericGroupSeparator

`ShallowRef`\<`string`\>

###### locale.provide

(`props`) => `LocaleInstance`

###### locale.rtl

`Ref`\<`Record`\<`string`, `boolean`\>, `Record`\<`string`, `boolean`\>\>

###### locale.rtlClasses

`Ref`\<`string`, `string`\>

###### locale.t

(`key`, ...`params`) => `string`

###### theme

`ThemeInstance` & `object`

###### unmount

() => `void`

#### Returns

`void`

#### Inherited from

`PluginControlOptions.expose`

***

### goTo?

> `optional` **goTo?**: `Partial`\<`InternalGoToOptions`\>

Defined in: node\_modules/.pnpm/vuetify@4.1.2\_typescript@6.0.3\_vue@3.5.32\_typescript@6.0.3\_/node\_modules/vuetify/lib/framework.d.ts:2786

#### Inherited from

`VuetifyOptions.goTo`

***

### icons?

> `optional` **icons?**: `Partial`\<`InternalIconOptions`\>

Defined in: node\_modules/.pnpm/vuetify@4.1.2\_typescript@6.0.3\_vue@3.5.32\_typescript@6.0.3\_/node\_modules/vuetify/lib/framework.d.ts:2788

#### Inherited from

`VuetifyOptions.icons`

***

### locale?

> `optional` **locale?**: `LocaleOptions` & `RtlOptions`

Defined in: node\_modules/.pnpm/vuetify@4.1.2\_typescript@6.0.3\_vue@3.5.32\_typescript@6.0.3\_/node\_modules/vuetify/lib/framework.d.ts:2789

#### Inherited from

`VuetifyOptions.locale`

***

### ssr?

> `optional` **ssr?**: `SSROptions`

Defined in: node\_modules/.pnpm/vuetify@4.1.2\_typescript@6.0.3\_vue@3.5.32\_typescript@6.0.3\_/node\_modules/vuetify/lib/framework.d.ts:2790

#### Inherited from

`VuetifyOptions.ssr`

***

### theme?

> `optional` **theme?**: `ThemeOptions`

Defined in: node\_modules/.pnpm/vuetify@4.1.2\_typescript@6.0.3\_vue@3.5.32\_typescript@6.0.3\_/node\_modules/vuetify/lib/framework.d.ts:2787

#### Inherited from

`VuetifyOptions.theme`
