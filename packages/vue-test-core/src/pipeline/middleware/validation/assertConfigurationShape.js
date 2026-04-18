/**
 * Ensures that the input configuration parameters are of the correct type.
 * @type {PipelineMiddleware}
 */
export const assertConfigurationShape = (ctx) => {
    const schemas = [
        { val: ctx.defaultMountOptions, name: 'defaultMountOptions' },
        { val: ctx.mountOptions, name: 'mountOptions' },
        { val: ctx.extraOptions, name: 'extraOptions' },
    ]

    schemas.forEach(({ val, name }) => {
        if (val !== null && typeof val === 'object' && !Array.isArray(val)) {
            return
        }
        throw new Error(
            `[TestFramework] Critical error: "${name}" must be an Object. ` +
                `Received ${
                    Array.isArray(val) ? 'array' : typeof val
                } (${val}).`
        )
    })
}
