context('Playlists', () => {
  beforeEach(() => cy.$login())

  it('displays a playlist when sidebar menu item is clicked', () => {
    cy.intercept('/api/playlist/1/songs', {
      fixture: 'playlist-songs.get.200.json'
    })

    cy.$clickSidebarItem('Simple Playlist')

    cy.get('#playlistWrapper').within(() => {
      cy.get('.heading-wrapper').should('be.visible').and('contain', 'Simple Playlist')
      cy.$getSongRows().should('have.length', 3)
      cy.findByText('Download All').should('be.visible')
      ;['.btn-shuffle-all', '.btn-delete-playlist'].forEach(selector => cy.get(selector).should('be.visible'))
    })
  })

  it('deletes a playlist', () => {
    cy.intercept('/api/playlist/1/songs', {
      fixture: 'playlist-songs.get.200.json'
    })

    cy.intercept('DELETE', '/api/playlist/1', {})

    cy.$clickSidebarItem('Simple Playlist').as('menuItem')
    cy.get('#playlistWrapper .btn-delete-playlist').click().$confirm()
    cy.url().should('contain', '/#!/home')
    cy.get('@menuItem').should('not.exist')
  })

  it('deletes a playlist from the sidebar', () => {
    cy.intercept('/api/playlist/2/songs', {
      fixture: 'playlist-songs.get.200.json'
    })

    cy.intercept('DELETE', '/api/playlist/2', {})

    cy.get('#sidebar').findByText('Smart Playlist').as('menuItem').rightclick()
    cy.findByTestId('playlist-context-menu-delete-2').click()
    cy.$confirm()

    cy.url().should('contain', '/#!/home')
    cy.get('@menuItem').should('not.exist')
  })

  it('creates a simple playlist from the sidebar', () => {
    cy.intercept('/api/playlist/3/songs', [])

    cy.intercept('POST', '/api/playlist', {
      fixture: 'playlist.post.200.json'
    })

    cy.findByTestId('sidebar-create-playlist-btn').click()
    cy.findByTestId('playlist-context-menu-create-simple').click()

    cy.get('[name=create-simple-playlist-form] [name=name]').as('nameInput').should('be.visible')
    cy.get('@nameInput').clear().type('A New Playlist{enter}')
    cy.get('#sidebar').findByText('A New Playlist').should('exist').and('have.class', 'active')
    cy.findByText('Playlist "A New Playlist" created.').should('be.visible')
    cy.get('#playlistWrapper .heading-wrapper').should('be.visible').and('contain', 'A New Playlist')

    cy.get('#playlistWrapper [data-testid=screen-empty-state]')
      .should('be.visible')
      .and('contain', 'The playlist is currently empty.')
  })

  it('adds songs into an existing playlist', () => {
    cy.intercept('/api/playlist/1/songs', {
      fixture: 'playlist-songs.get.200.json'
    })

    cy.intercept('PUT', '/api/playlist/1/sync', {})

    cy.$assertPlaylistSongCount('Simple Playlist', 3)

    cy.$clickSidebarItem('All Songs')

    cy.get('#songsWrapper').within(() => {
      cy.$selectSongRange(0, 1)
      cy.findByTestId('add-to-btn').click()
      cy.findByTestId('add-to-menu')
        .should('be.visible')
        .within(() => cy.findByText('Simple Playlist').click())
        .should('not.be.visible')
    })

    cy.findByText('Added 2 songs into "Simple Playlist."').should('be.visible')
    cy.$assertPlaylistSongCount('Simple Playlist', 5)
  })

  it('creates a playlist directly from songs', () => {
    cy.intercept('POST', '/api/playlist', {
      fixture: 'playlist.post.200.json'
    })

    cy.intercept('/api/playlist/3/songs', {
      fixture: 'playlist-songs.get.200.json'
    })

    cy.$clickSidebarItem('All Songs')

    cy.get('#songsWrapper').within(() => {
      cy.$selectSongRange(0, 2)
      cy.findByTestId('add-to-btn').click()
      cy.findByTestId('new-playlist-name').type('A New Playlist{enter}')
    })

    cy.get('#sidebar').findByText('A New Playlist').should('exist').and('have.class', 'active')

    cy.findByText('Playlist "A New Playlist" created.').should('be.visible')
    cy.$assertPlaylistSongCount('A New Playlist', 3)
  })

  it('updates a simple playlist from the sidebar', () => {
    cy.intercept('PUT', '/api/playlist/1', {})
    cy.intercept('/api/playlist/1/songs', {
      fixture: 'playlist-songs.get.200.json'
    })

    cy.get('#sidebar').findByText('Simple Playlist').as('menuItem').dblclick()
    cy.findByTestId('inline-playlist-name-input').as('nameInput').should('be.focused')
    cy.get('@nameInput').clear().type('A New Name{enter}')
    cy.get('@menuItem').should('contain', 'A New Name').and('have.class', 'active')
    cy.findByText('Playlist "A New Name" updated.').should('be.visible')
    cy.get('#playlistWrapper .heading-wrapper').should('be.visible').and('contain', 'A New Name')
  })

  it('creates a smart playlist', () => {
    cy.intercept('POST', '/api/playlist', {
      fixture: 'playlist-smart.post.200.json'
    })

    cy.intercept('/api/playlist/3/songs', {
      fixture: 'playlist-songs.get.200.json'
    })

    cy.findByTestId('sidebar-create-playlist-btn').click()
    cy.findByTestId('playlist-context-menu-create-smart').click()

    cy.findByTestId('create-smart-playlist-form')
      .should('be.visible')
      .within(() => {
        cy.get('[name=name]').should('be.focused').type('My Smart Playlist')
        cy.get('.btn-add-group').click()

        cy.get('[name="model[]"]').select('Album')
        cy.get('[name="operator[]"]').select('is not')
        cy.wait(0) // the "value" text box is rendered asynchronously
        cy.get('[name="value[]"]').type('Foo')

        // Add a second rule
        cy.get('.btn-add-rule').click()
        cy.get('[data-testid=smart-playlist-rule-row]:nth-child(3) [name="model[]"]').select('Length')
        cy.get('[data-testid=smart-playlist-rule-row]:nth-child(3) [name="operator[]"]').select('is greater than')
        cy.wait(0)
        cy.get('[data-testid=smart-playlist-rule-row]:nth-child(3) [name="value[]"]').type('180')

        // Add another group (and rule)
        cy.get('.btn-add-group').click()
        cy.get('[data-testid=smart-playlist-rule-group]:nth-child(2) [name="value[]"]').type('Whatever')

        // Remove a rule from the first group
        cy.get(`
          [data-testid=smart-playlist-rule-group]:first-child
          [data-testid=smart-playlist-rule-row]:nth-child(2)
          .remove-rule
        `).click()

        cy.get('[data-testid=smart-playlist-rule-group]:first-child [data-testid=smart-playlist-rule-row]')
          .should('have.length', 1)

        cy.findByText('Save').click()
      })

    cy.findByText('Playlist "My Smart Playlist" created.').should('be.visible')
    cy.get('#playlistWrapper .heading-wrapper').should('be.visible').and('contain', 'My Smart Playlist')

    cy.$assertSidebarItemActive('My Smart Playlist')
    cy.$assertPlaylistSongCount('My Smart Playlist', 3)
  })

  it('updates a smart playlist', () => {
    cy.intercept('/api/playlist/2/songs', {
      fixture: 'playlist-songs.get.200.json'
    })

    cy.intercept('/api/playlist/2/songs', {
      fixture: 'playlist-songs.get.200.json'
    })

    cy.intercept('PUT', '/api/playlist/2', {})

    cy.get('#sidebar').findByText('Smart Playlist').rightclick()
    cy.findByTestId('playlist-context-menu-edit-2').click()

    cy.findByTestId('edit-smart-playlist-form').should('be.visible').within(() => {
      cy.get('[name=name]').should('be.focused').and('contain.value', 'Smart Playlist')
        .clear().type('A Different Name')

      cy.get('[data-testid=smart-playlist-rule-group]').should('have.length', 2)

      // Add another rule into the second group
      cy.get('[data-testid=smart-playlist-rule-group]:nth-child(2) .btn-add-rule').click()
      cy.get('[data-testid=smart-playlist-rule-row]:nth-child(3) [name="model[]"]').select('Album')
      cy.get('[data-testid=smart-playlist-rule-row]:nth-child(3) [name="operator[]"]').select('contains')
      cy.wait(0)
      cy.get('[data-testid=smart-playlist-rule-row]:nth-child(3) [name="value[]"]').type('keyword')
      cy.get('[data-testid=smart-playlist-rule-group]:nth-child(2) [data-testid=smart-playlist-rule-row]')
        .should('have.length', 2)

      cy.findByText('Save').click()
    })

    cy.findByText('Playlist "A Different Name" updated.').should('be.visible')
    cy.get('#playlistWrapper .heading-wrapper').should('be.visible').and('contain', 'A Different Name')
  })
})
