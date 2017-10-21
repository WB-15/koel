<?php

namespace App\Http\Controllers\API;

use App\Http\Requests\API\ViewSongRequest;
use App\Models\Album;
use Illuminate\Http\RedirectResponse;
use iTunes;

class iTunesController extends Controller
{
    /**
     * View a song on iTunes store.
     *
     * @param ViewSongRequest $request
     * @param Album           $album
     *
     * @return RedirectResponse
     */
    public function viewSong(ViewSongRequest $request, Album $album)
    {
        $url = iTunes::getTrackUrl($request->q, $album->name, $album->artist->name);
        abort_unless($url, 404, "Koel can't find such a song on iTunes Store.");

        return redirect($url);
    }
}
