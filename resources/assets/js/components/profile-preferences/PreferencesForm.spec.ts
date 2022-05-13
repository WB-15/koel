import { expect, it } from 'vitest'
import isMobile from 'ismobilejs'
import UnitTestCase from '@/__tests__/UnitTestCase'
import PreferencesForm from './PreferencesForm.vue'

new class extends UnitTestCase {
  protected test () {
    it('has "Transcode on mobile" option for mobile users', () => {
      isMobile.phone = true
      const { getByLabelText } = this.render(PreferencesForm)
      getByLabelText('Convert and play media at 128kbps on mobile')
    })

    it('does not have "Transcode on mobile" option for non-mobile users', async () => {
      isMobile.phone = false
      const { queryByLabelText } = this.render(PreferencesForm)
      expect(await queryByLabelText('Convert and play media at 128kbps on mobile')).toBeNull()
    })
  }
}
