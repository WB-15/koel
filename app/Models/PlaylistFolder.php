<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

/**
 * @property string $id
 * @property string $name
 * @property User $user
 * @property Collection|array<array-key, Playlist> $playlists
 * @property int $user_id
 * @property Carbon $created_at
 */
class PlaylistFolder extends Model
{
    use HasFactory;

    public $incrementing = false;
    protected $keyType = 'string';
    protected $guarded = ['id'];

    protected static function booted(): void
    {
        static::creating(static fn (self $folder) => $folder->id = Str::uuid()->toString());
    }

    public function playlists(): HasMany
    {
        return $this->hasMany(Playlist::class, 'folder_id');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
