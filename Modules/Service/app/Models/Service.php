<?php

namespace Modules\Service\Models;

use App\Models\BaseModel;
use App\Models\User;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;

/**
 * @property int $id
 * @property string $uuid
 * @property int $user_id
 * @property int|null $technician_id
 * @property string $title
 * @property string $slug
 * @property string|null $short_description
 * @property string|null $description
 * @property float $price
 * @property int $delivery_days
 * @property string $status
 */
class Service extends BaseModel implements HasMedia
{
    use HasFactory, InteractsWithMedia;

    protected $fillable = [
        'uuid',
        'user_id',
        'technician_id',
        'title',
        'slug',
        'short_description',
        'description',
        'price',
        'delivery_days',
        'status',
    ];

    protected $casts = [
        'price' => 'float',
        'delivery_days' => 'integer',
    ];

    protected $attributes = [
        'status' => 'draft',
    ];

    /**
     * The "booted" method of the model.
     */
    protected static function booted(): void
    {
        parent::booted();

        static::creating(function (Service $service) {
            if (empty($service->uuid)) {
                $service->uuid = (string) Str::uuid();
            }

            if (empty($service->slug)) {
                $service->slug = static::generateUniqueSlug($service->title);
            }
        });
    }

    /**
     * Generate a unique slug for the service.
     */
    public static function generateUniqueSlug(string $title): string
    {
        $slug = Str::slug($title);
        $count = static::where('slug', 'LIKE', $slug.'%')->count();

        if ($count > 0) {
            $slug .= '-'.($count + 1);
        }

        return $slug;
    }

    /**
     * Get the owner (admin) who created this service.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the technician (instructor) assigned to this service.
     */
    public function technician(): BelongsTo
    {
        return $this->belongsTo(User::class, 'technician_id');
    }

    /**
     * Get the orders placed for this service.
     */
    public function orders(): HasMany
    {
        return $this->hasMany(ServiceOrder::class);
    }

    /**
     * Scope a query to only include published services.
     */
    public function scopePublished(Builder $query): Builder
    {
        return $query->where('status', 'published');
    }

    /**
     * Scope a query to search by title.
     */
    public function scopeSearchTitle(Builder $query, ?string $term): Builder
    {
        return $query->when($term, fn (Builder $q) => $q->where('title', 'LIKE', "%{$term}%"));
    }

    /**
     * Get the formatted price attribute.
     */
    public function getFormattedPriceAttribute(): string
    {
        $currency = app('system')->fields['selling_currency'] ?? 'USD';

        return $currency.' '.number_format((float) $this->price, 2);
    }

    /**
     * Get the thumbnail URL from the media collection.
     */
    public function getThumbnailAttribute(): ?string
    {
        $url = $this->getFirstMediaUrl('thumbnail');

        return $url !== '' ? $url : null;
    }

    /**
     * Get available statuses.
     */
    public static function getStatuses(): array
    {
        return [
            'draft' => 'Draft',
            'published' => 'Published',
            'archived' => 'Archived',
        ];
    }
}
