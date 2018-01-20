import Component from '@/components/main-wrapper/main-content/playlist.vue'
import SongList from '@/components/shared/song-list.vue'
import factory from '@/tests/factory'
import { event, alerts } from '@/utils'
import { playlistStore } from '@/stores'

describe('components/main-wrapper/main-content/playlist', () => {
  it('renders properly', () => {
    const playlist = factory('playlist', { populated: true })
    const wrapper = shallow(Component, { data: { playlist }})
    wrapper.find('h1.heading').html().should.contain(playlist.name)
    wrapper.has(SongList).should.be.true
  })

  it('fetch and populate playlist content on demand', () => {
    const playlist = factory('playlist', { songs: [] })
    shallow(Component)
    const fetchSongsStub = sinon.stub(playlistStore, 'fetchSongs')
    event.emit('main-content-view:load', 'playlist', playlist)
    fetchSongsStub.calledWith(playlist).should.be.true
    fetchSongsStub.restore()
  })

  it('displays a fallback message if the playlist is empty', () => {
    shallow(Component, { data: {
      playlist: factory('playlist', {
        populated: true,
        songs: []
      })
    }}).has('div.none').should.be.true
  })

  it('confirms deleting if the playlist is not empty', () => {
    const wrapper = mount(Component)
    const playlist = factory('playlist', {
      populated: true,
      songs: factory('song', 3)
    })
    wrapper.setData({ playlist })
    const confirmStub = sinon.stub(alerts, 'confirm')
    wrapper.click('.btn-delete-playlist')
    confirmStub.calledWith('Are you sure? This is a one-way street!', wrapper.vm.del).should.be.true
    confirmStub.restore()
  })

  it("doesn't confirm deleting if the playlist is empty", () => {
    const wrapper = mount(Component)
    const playlist = factory('playlist', {
      populated: true,
      songs: []
    })
    wrapper.setData({ playlist })
    const confirmStub = sinon.stub(alerts, 'confirm')
    const deleteStub = sinon.stub(playlistStore, 'delete')
    wrapper.click('.btn-delete-playlist')
    confirmStub.called.should.be.false
    deleteStub.calledWith(playlist).should.be.true
    confirmStub.restore()
    deleteStub.restore()
  })
})
