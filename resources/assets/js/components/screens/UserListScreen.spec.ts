import { expect, it } from 'vitest'
import UnitTestCase from '@/__tests__/UnitTestCase'
import factory from '@/__tests__/factory'
import { screen } from '@testing-library/vue'
import { http } from '@/services'
import { eventBus } from '@/utils'
import Btn from '@/components/ui/Btn.vue'
import BtnGroup from '@/components/ui/BtnGroup.vue'
import UserListScreen from './UserListScreen.vue'

new class extends UnitTestCase {
  private async renderComponent (users: User[] = []) {
    if (users.length === 0) {
      users = factory<User>('user', 6)
    }

    const fetchMock = this.mock(http, 'get').mockResolvedValue(users)

    this.render(UserListScreen, {
      global: {
        stubs: {
          Btn,
          BtnGroup,
          UserCard: this.stub('user-card')
        }
      }
    })

    expect(fetchMock).toHaveBeenCalledWith('users')

    await this.tick(2)
  }

  protected test () {
    it('displays a list of users', async () => {
      await this.renderComponent()

      expect(screen.getAllByTestId('user-card')).toHaveLength(6)
      expect(screen.queryByTestId('prospects-heading')).toBeNull()
    })

    it('displays a list of user prospects', async () => {
      const users = [...factory.states('prospect')<User>('user', 2), ...factory<User>('user', 3)]
      await this.renderComponent(users)

      expect(screen.getAllByTestId('user-card')).toHaveLength(5)
      screen.getByTestId('prospects-heading')
    })

    it('triggers create user modal', async () => {
      const emitMock = this.mock(eventBus, 'emit')
      await this.renderComponent()

      await this.user.click(screen.getByRole('button', { name: 'Add' }))

      expect(emitMock).toHaveBeenCalledWith('MODAL_SHOW_ADD_USER_FORM')
    })

    it('triggers invite user modal', async () => {
      const emitMock = this.mock(eventBus, 'emit')
      await this.renderComponent()

      await this.user.click(screen.getByRole('button', { name: 'Invite' }))

      expect(emitMock).toHaveBeenCalledWith('MODAL_SHOW_INVITE_USER_FORM')
    })
  }
}
