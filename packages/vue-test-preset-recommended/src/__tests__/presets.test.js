import { presets } from '../presets'
import { validatePreset } from '@testforge/vue-test-core'

describe('presets', () => {
    it('should be valid', () => {
        validatePreset('default', presets['default'])
    })
})
