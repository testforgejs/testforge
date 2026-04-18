import { createPlugins } from '../createPlugins'

describe('createPlugins', () => {
    // A helper for creating a Mock plugin with hooks
    const createMockPlugin = (name, instance = { id: `inst-${name}` }) => {
        // Create the definition ONCE
        const definition = {
            beforeCreate: jest.fn((ctx, opts) => ({ ...opts, modified: true })),
            create: jest.fn(() => instance),
            afterCreate: jest.fn(),
        }

        return {
            getName: () => name,
            // Always return the same object
            getDefinition: () => definition,
        }
    }

    it('should create plugins based on manifest and options', () => {
        const mockPinia = createMockPlugin('pinia')
        const ctx = {
            preset: {
                manifest: [{ module: mockPinia, enabled: true }],
            },
        }
        const options = { pinia: { some: 'opt' } }

        const result = createPlugins(options, ctx)

        const definition = mockPinia.getDefinition()

        // Checking hook calls
        expect(definition.beforeCreate).toHaveBeenCalledWith(ctx, options.pinia)
        expect(definition.create).toHaveBeenCalledWith({
            some: 'opt',
            modified: true,
        })
        expect(definition.afterCreate).toHaveBeenCalledWith(result[0], ctx)

        expect(result).toHaveLength(1)
        expect(result[0]).toEqual({ id: 'inst-pinia' })
    })

    it('should skip plugins that are set to false in options', () => {
        const mockI18n = createMockPlugin('i18n')
        const ctx = {
            preset: {
                manifest: [{ module: mockI18n, enabled: true }],
            },
        }
        const options = { i18n: false } // Clearly turned off by the user

        const result = createPlugins(options, ctx)

        expect(result).toHaveLength(0)
        expect(mockI18n.getDefinition().create).not.toHaveBeenCalled()
    })

    it('should ignore options for plugins not present in the manifest', () => {
        const mockPinia = createMockPlugin('pinia')
        const ctx = {
            preset: {
                manifest: [{ module: mockPinia, enabled: true }],
            },
        }
        // Passing options for a ‘router’ that is not in the manifest
        const options = { pinia: {}, router: {} }

        const result = createPlugins(options, ctx)

        expect(result).toHaveLength(1)
        expect(result[0].id).toBe('inst-pinia')
    })

    it('should work correctly if optional hooks (before/after) are missing', () => {
        const simplePlugin = {
            getName: () => 'simple',
            getDefinition: () => ({
                create: () => ({ isSimple: true }),
            }),
        }
        const ctx = {
            preset: { manifest: [{ module: simplePlugin, enabled: true }] },
        }

        const result = createPlugins({ simple: {} }, ctx)

        expect(result[0]).toEqual({ isSimple: true })
    })

    it('should skip plugin if options are missing (undefined) for that plugin', () => {
        const mockPinia = createMockPlugin('pinia')
        const ctx = {
            preset: { manifest: [{ module: mockPinia, enabled: true }] },
        }

        const result = createPlugins({}, ctx) // Options not passed

        expect(result).toHaveLength(0)
    })
})
