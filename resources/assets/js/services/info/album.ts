import { secondsToHis } from '@/utils'
import { http } from '..'

export const albumInfo = {
  async fetch (album: Album): Promise<Album> {
    if (!album.info) {
      const info = await http.get<AlbumInfo|null>(`album/${album.id}/info`)

      if (info) {
        this.merge(album, info)
      }
    }

    return album
  },

  /**
   * Merge the (fetched) info into an album.
   */
  merge: (album: Album, info: AlbumInfo): void => {
    // Convert the duration into i:s
    if (info.tracks) {
      info.tracks.forEach(track => {
        track.fmtLength = secondsToHis(track.length)
      })
    }

    // If the album cover is not in a nice form, discard.
    if (typeof info.image !== 'string') {
      info.image = null
    }

    // Set the album cover on the client side to the retrieved image from server.
    if (info.image) {
      album.cover = info.image
    }

    album.info = info
  }
}
