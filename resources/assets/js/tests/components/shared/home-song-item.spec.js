import Component from '@/components/shared/home-song-item.vue'
import factory from '@/tests/factory'
import { queueStore } from '@/stores'
import { playback } from '@/services'

describe('components/shared/home-song-item', () => {
  let propsData 
  let song 

  beforeEach(() => { 
    song = factory('song', {
      artist: factory('artist', { name: 'Foo Fighter' }),
      playCount: 10,
      playbackState: 'stopped'
    })

    propsData = { song }
  })

  it('renders properly', () => {
    const wrapper = shallow(Component, { propsData }) 
    wrapper.hasAll('span.cover', 'span.details').should.be.true
    wrapper.html().should.contain('Foo Fighter')
    wrapper.html().should.contain('10 plays')
  })

  it('queues and plays if not queued', () => {
    const containsStub = sinon.stub(queueStore, 'contains').callsFake(() => false)
    const queueStub = sinon.stub(queueStore, 'queueAfterCurrent')
    const playStub = sinon.stub(playback, 'play')
    shallow(Component, { propsData }).dblclick('.song-item-home')
    containsStub.calledWith(song).should.be.true
    queueStub.calledWith(song).should.be.true
    playStub.calledWith(song).should.be.true

    containsStub.restore()
    queueStub.restore()
    playStub.restore()
  })

  it('just plays if queued', () => {
    const containsStub = sinon.stub(queueStore, 'contains').callsFake(() => true)
    const queueStub = sinon.stub(queueStore, 'queueAfterCurrent')
    const playStub = sinon.stub(playback, 'play')
    shallow(Component, { propsData }).dblclick('.song-item-home')
    containsStub.calledWith(song).should.be.true
    queueStub.called.should.be.false
    playStub.calledWith(song).should.be.true

    containsStub.restore()
    queueStub.restore()
    playStub.restore()
  })

  it('changes state', () => {
    const wrapper = shallow(Component, { propsData })
    const playStub = sinon.stub(wrapper.vm, 'play')
    const resumeStub = sinon.stub(playback, 'resume')
    const pauseStub = sinon.stub(playback, 'pause')

    wrapper.click('.cover .control')
    playStub.called.should.be.true
    song.playbackState = 'paused'
    wrapper.click('.cover .control')
    resumeStub.called.should.be.true
    song.playbackState = 'playing'
    wrapper.click('.cover .control')
    pauseStub.called.should.be.true

    playStub.restore()
    resumeStub.restore()
    pauseStub.restore()
  })
})
