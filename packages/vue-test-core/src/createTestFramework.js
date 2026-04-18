import { mergeComponentData } from './utils/mergeComponentData'
import { createMountContext } from './pipeline/createMountContext'
import { createPipeline } from './pipeline/createPipeline'
import { createMountPipeline } from './pipeline/createMountPipeline'
import { mountWithPlugins } from './mountWithPlugins'

export function createTestFramework({ presets = {} } = {}) {
    return {
        /**
         * Creates a test wrapper for a component with passed props and mount options.
         *
         * @param {import('vue').Component} component - Vue Component for testing.
         * @param {Object} [defaultProps={}] - Default props for the component.
         * @param {ComponentFactoryOptions} [defaultMountOptions={}] - Default mounting options (global, plugins, etc.).
         * @param {Object} [defaultSlots={}] - Default slots to pass into component.
         * @returns {ComponentFactory}
         * Returns a function that mounts the component with merged props and mount options.
         */
        testComponentFactory(
            component,
            defaultProps = {},
            defaultMountOptions = {},
            defaultSlots = {}
        ) {
            return (
                props = {},
                mountOptions = {},
                slots = {},
                extraOptions = {}
            ) => {
                const {
                    skipDefaultProps = false,
                    skipDefaultSlots = false,
                    skipDefaultOptions = false,
                } = extraOptions

                // Merging props and slots (basic)
                const finalProps = mergeComponentData({
                    defaultMountData: defaultMountOptions.props,
                    defaultData: defaultProps,
                    mountData: mountOptions.props,
                    directData: props,
                    skipDefault: skipDefaultProps,
                    skipOptions: skipDefaultOptions,
                })
                const finalSlots = mergeComponentData({
                    defaultMountData: defaultMountOptions.slots,
                    defaultData: defaultSlots,
                    mountData: mountOptions.slots,
                    directData: slots,
                    skipDefault: skipDefaultSlots,
                    skipOptions: skipDefaultOptions,
                })

                const ctx = createMountContext({
                    defaultMountOptions,
                    mountOptions,
                    extraOptions,
                    presets,
                })

                const pipeline = createPipeline(createMountPipeline(ctx))
                pipeline.run(ctx)

                return mountWithPlugins(component, ctx, {
                    props: finalProps,
                    slots: finalSlots,
                })
            }
        },
    }
}
