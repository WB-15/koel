<?php

namespace App\Services\Streamers;

use App\Models\Song;

interface StreamerInterface
{
    public function setSong(Song $song): void;

    /** @return mixed */
    public function stream();
}
