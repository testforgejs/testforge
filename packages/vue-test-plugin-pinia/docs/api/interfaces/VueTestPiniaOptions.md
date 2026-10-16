[**@testforgejs/vue-test-plugin-pinia**](../README.md)

***

Defined in: [packages/vue-test-plugin-pinia/src/types/types.ts:26](https://github.com/testforgejs/testforge/blob/3d728172a303d7e9d78fc42ed41f076e9b5d2096/packages/vue-test-plugin-pinia/src/types/types.ts#L26)

Configuration options for the Pinia test plugin.

Combines native Pinia testing options with TestForge-specific
controls for managed plugin instances and store initialization.

TestForge-specific options are handled internally and are not
forwarded to the native Pinia testing factory.

## See

 - `TestingOptions` from `@pinia/testing` for native Pinia testing configuration.
 - `PluginControlOptions` from `@testforgejs/vue-test-core` for type-safe instance capturing.

## Extends

- `TestingOptions`.`PluginControlOptions`\<`TestingPinia`\>

## Properties

### \[PLUGIN\_EXPOSE\]?

> `optional` **\[PLUGIN\_EXPOSE\]?**: (`instance`) => `void`

Defined in: [packages/vue-test-core/src/types.ts:224](https://github.com/testforgejs/testforge/blob/3d728172a303d7e9d78fc42ed41f076e9b5d2096/packages/vue-test-core/src/types.ts#L224)

#### Parameters

##### instance

`TestingPinia`

#### Returns

`void`

#### Inherited from

`PluginControlOptions.[PLUGIN_EXPOSE]`

***

### createSpy?

> `optional` **createSpy?**: (`fn?`) => (...`args`) => `any`

Defined in: node\_modules/.pnpm/@pinia+testing@2.0.1\_pinia@4.0.3\_@vue+devtools-api@8.2.1\_typescript@6.0.3\_vue@3.5.41\_typescript@6.0.3\_\_/node\_modules/@pinia/testing/dist/index.d.mts:52

Function used to create a spy for actions and `$patch()`. Pre-configured
with `jest.fn` in Jest projects or `vi.fn` in Vitest projects if
`globals: true` is set.

#### Parameters

##### fn?

(...`args`) => `any`

#### Returns

(...`args`) => `any`

#### Inherited from

`TestingOptions.createSpy`

***

### fakeApp?

> `optional` **fakeApp?**: `boolean`

Defined in: node\_modules/.pnpm/@pinia+testing@2.0.1\_pinia@4.0.3\_@vue+devtools-api@8.2.1\_typescript@6.0.3\_vue@3.5.41\_typescript@6.0.3\_\_/node\_modules/@pinia/testing/dist/index.d.mts:46

Creates an empty App and calls `app.use(pinia)` with the created testing
pinia. This allows you to use plugins while unit testing stores as
plugins **will wait for pinia to be installed in order to be executed**.
Defaults to false.

#### Inherited from

`TestingOptions.fakeApp`

***

### initialState?

> `optional` **initialState?**: `StateTree`

Defined in: node\_modules/.pnpm/@pinia+testing@2.0.1\_pinia@4.0.3\_@vue+devtools-api@8.2.1\_typescript@6.0.3\_vue@3.5.41\_typescript@6.0.3\_\_/node\_modules/@pinia/testing/dist/index.d.mts:9

Allows defining a partial initial state of all your stores. This state gets applied after a store is created,
allowing you to only set a few properties that are required in your test.

#### Inherited from

`TestingOptions.initialState`

***

### mockStores?

> `optional` **mockStores?**: [`MockStoresFn`](../type-aliases/MockStoresFn.md)

Defined in: [packages/vue-test-plugin-pinia/src/types/types.ts:45](https://github.com/testforgejs/testforge/blob/3d728172a303d7e9d78fc42ed41f076e9b5d2096/packages/vue-test-plugin-pinia/src/types/types.ts#L45)

A callback for initializing or modifying Pinia stores after the
testing Pinia instance is created and before the component is mounted.

#### Example

```ts
factory({}, {
  plugins: {
    pinia: {
      mockStores: (pinia) => {
        const store = useCounterStore(pinia);
        store.count = 42;
      },
    },
  },
});
```

***

### plugins?

> `optional` **plugins?**: `PiniaPlugin`[]

Defined in: node\_modules/.pnpm/@pinia+testing@2.0.1\_pinia@4.0.3\_@vue+devtools-api@8.2.1\_typescript@6.0.3\_vue@3.5.41\_typescript@6.0.3\_\_/node\_modules/@pinia/testing/dist/index.d.mts:14

Plugins to be installed before the testing plugin. Add any plugins used in
your application that will be used while testing.

#### Inherited from

`TestingOptions.plugins`

***

### stubActions?

> `optional` **stubActions?**: `boolean` \| `string`[] \| ((`actionName`, `store`) => `boolean`)

Defined in: node\_modules/.pnpm/@pinia+testing@2.0.1\_pinia@4.0.3\_@vue+devtools-api@8.2.1\_typescript@6.0.3\_vue@3.5.41\_typescript@6.0.3\_\_/node\_modules/@pinia/testing/dist/index.d.mts:28

When set to false, actions are only spied, but they will still get executed. When
set to true, **all** actions will be replaced with spies, resulting in their code
not being executed. When set to an array of action names, only those actions
will be stubbed. When set to a function, it will be called for each action with
the action name and store instance, and should return true to stub the action.

NOTE: when providing `createSpy()`,
it will **only** make the `fn` argument `undefined`. You still have to
handle this in `createSpy()`.

#### Default

```ts
true
```

#### Inherited from

`TestingOptions.stubActions`

***

### stubPatch?

> `optional` **stubPatch?**: `boolean`

Defined in: node\_modules/.pnpm/@pinia+testing@2.0.1\_pinia@4.0.3\_@vue+devtools-api@8.2.1\_typescript@6.0.3\_vue@3.5.41\_typescript@6.0.3\_\_/node\_modules/@pinia/testing/dist/index.d.mts:34

When set to true, calls to `$patch()` won't change the state. Defaults to
false. NOTE: when providing `createSpy()`, it will **only** make the `fn`
argument `undefined`. You still have to handle this in `createSpy()`.

#### Inherited from

`TestingOptions.stubPatch`

***

### stubReset?

> `optional` **stubReset?**: `boolean`

Defined in: node\_modules/.pnpm/@pinia+testing@2.0.1\_pinia@4.0.3\_@vue+devtools-api@8.2.1\_typescript@6.0.3\_vue@3.5.41\_typescript@6.0.3\_\_/node\_modules/@pinia/testing/dist/index.d.mts:39

When set to true, calls to `$reset()` won't change the state. Defaults to
false.

#### Inherited from

`TestingOptions.stubReset`
