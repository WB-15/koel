<?php

namespace App\Listeners;

use App\Events\SongLikeToggled;
use App\Services\LastfmService;
use Illuminate\Contracts\Queue\ShouldQueue;

class LoveTrackOnLastfm implements ShouldQueue
{
    public function __construct(private LastfmService $lastfm)
    {
    }

    public function handle(SongLikeToggled $event): void
    {
        if (
            !LastfmService::enabled() ||
            !$event->interaction->user->lastfm_session_key ||
            $event->interaction->song->artist->is_unknown
        ) {
            return;
        }

        $this->lastfm->toggleLoveTrack(
            $event->interaction->song,
            $event->interaction->user,
            $event->interaction->liked
        );
    }
}
