import { expect, it } from 'vitest'
import { preferenceStore } from '@/stores'
import UnitTestCase from '@/__tests__/UnitTestCase'
import { fireEvent } from '@testing-library/vue'
import { playbackService } from '@/services'
import RepeatModeSwitch from './RepeatModeSwitch.vue'

new class extends UnitTestCase {
  protected test () {
    it('changes mode', async () => {
      const mock = this.mock(playbackService, 'changeRepeatMode')
      preferenceStore.state.repeatMode = 'NO_REPEAT'
      const { getByRole } = this.render(RepeatModeSwitch)

      await fireEvent.click(getByRole('button'))

      expect(mock).toHaveBeenCalledOnce()
    })
  }
}
