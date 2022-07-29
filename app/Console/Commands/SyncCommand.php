<?php

namespace App\Console\Commands;

use App\Libraries\WatchRecord\InotifyWatchRecord;
use App\Models\Setting;
use App\Services\FileSynchronizer;
use App\Services\MediaSyncService;
use Illuminate\Console\Command;
use Symfony\Component\Console\Helper\ProgressBar;

class SyncCommand extends Command
{
    protected $signature = 'koel:sync
        {record? : A single watch record. Consult Wiki for more info.}
        {--ignore= : The comma-separated tags to ignore (exclude) from syncing}
        {--force : Force re-syncing even unchanged files}';

    protected $description = 'Sync songs found in configured directory against the database.';
    private int $skippedCount = 0;
    private int $invalidCount = 0;
    private int $syncedCount = 0;

    private ?ProgressBar $progressBar = null;

    public function __construct(private MediaSyncService $mediaSyncService)
    {
        parent::__construct();
    }

    public function handle(): int
    {
        $this->ensureMediaPath();

        $record = $this->argument('record');

        if ($record) {
            $this->syncSingleRecord($record);
        } else {
            $this->syncAll();
        }

        return self::SUCCESS;
    }

    /**
     * Sync all files in the configured media path.
     */
    protected function syncAll(): void
    {
        $path = Setting::get('media_path');
        $this->info('Syncing media from ' . $path . PHP_EOL);

        // The excluded tags.
        // Notice that this is only meaningful for existing records.
        // New records will have every applicable field synced in.
        $excludes = $this->option('excludes') ? explode(',', $this->option('excludes')) : [];

        $this->mediaSyncService->sync($excludes, $this->option('force'), $this);

        $this->output->writeln(
            PHP_EOL . PHP_EOL
            . "<info>Completed! $this->syncedCount new or updated song(s)</info>, "
            . "$this->skippedCount unchanged song(s), "
            . "and <comment>$this->invalidCount invalid file(s)</comment>."
        );
    }

    /**
     * @param string $record The watch record.
     *                       As of current we only support inotifywait.
     *                       Some examples:
     *                       - "DELETE /var/www/media/gone.mp3"
     *                       - "CLOSE_WRITE,CLOSE /var/www/media/new.mp3"
     *                       - "MOVED_TO /var/www/media/new_dir"
     *
     * @see http://man7.org/linux/man-pages/man1/inotifywait.1.html
     */
    public function syncSingleRecord(string $record): void
    {
        $this->mediaSyncService->syncByWatchRecord(new InotifyWatchRecord($record));
    }

    /**
     * Log a song's sync status to console.
     */
    public function logSyncStatusToConsole(string $path, int $result, ?string $reason = null): void
    {
        $name = basename($path);

        if ($result === FileSynchronizer::SYNC_RESULT_UNMODIFIED) {
            ++$this->skippedCount;
        } elseif ($result === FileSynchronizer::SYNC_RESULT_BAD_FILE) {
            if ($this->option('verbose')) {
                $this->error(PHP_EOL . "'$name' is not a valid media file: $reason");
            }

            ++$this->invalidCount;
        } else {
            ++$this->syncedCount;
        }
    }

    public function createProgressBar(int $max): void
    {
        $this->progressBar = $this->getOutput()->createProgressBar($max);
    }

    public function advanceProgressBar(): void
    {
        $this->progressBar->advance();
    }

    private function ensureMediaPath(): void
    {
        if (Setting::get('media_path')) {
            return;
        }

        $this->warn("Media path hasn't been configured. Let's set it up.");

        while (true) {
            $path = $this->ask('Absolute path to your media directory');

            if (is_dir($path) && is_readable($path)) {
                Setting::set('media_path', $path);
                break;
            }

            $this->error('The path does not exist or is not readable. Try again.');
        }
    }
}
