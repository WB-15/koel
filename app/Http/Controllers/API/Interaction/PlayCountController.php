<?php

namespace App\Http\Controllers\API\Interaction;

use App\Events\SongStartedPlaying;
use App\Http\Requests\API\Interaction\StorePlayCountRequest;
use Illuminate\Http\JsonResponse;

class PlayCountController extends Controller
{
    /**
     * Increase a song's play count as the currently authenticated user.
     *
     * @return JsonResponse
     */
    public function store(StorePlayCountRequest $request)
    {
        $interaction = $this->interactionService->increasePlayCount($request->song, $request->user());

        if ($interaction) {
            event(new SongStartedPlaying($interaction->song, $interaction->user));
        }

        return response()->json($interaction);
    }
}
