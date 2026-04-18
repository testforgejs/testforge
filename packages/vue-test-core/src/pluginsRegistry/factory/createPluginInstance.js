import { exposeInstance } from '../helpers/exposeInstance'

export function createPluginInstance(factory, options) {
    const instance = options.__sharedInstance || factory(options)
    exposeInstance(instance, options)

    return instance
}
