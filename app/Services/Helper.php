<?php

namespace App\Services;

use SplFileInfo;

class Helper
{
    /**
     * Get a unique hash from a file path.
     * This hash can then be used as the Song record's ID.
     */
    public static function getFileHash(string $path): string
    {
        return md5(config('app.key') . $path);
    }

    public static function getModifiedTime(string|SplFileInfo $file): int
    {
        $file = is_string($file) ? new SplFileInfo($file) : $file;

        // Workaround for #344, where getMTime() fails for certain files with Unicode names on Windows.
        return attempt(static fn () => $file->getMTime()) ?? time();
    }
}
