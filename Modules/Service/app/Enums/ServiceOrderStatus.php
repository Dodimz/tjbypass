<?php

namespace Modules\Service\Enums;

enum ServiceOrderStatus: string
{
    case PENDING = 'pending';
    case PAID = 'paid';
    case IN_PROGRESS = 'in_progress';
    case DELIVERED = 'delivered';
    case COMPLETED = 'completed';
    case CANCELLED = 'cancelled';

    public function getLabel(): string
    {
        return match ($this) {
            self::PENDING => 'Pending',
            self::PAID => 'Paid',
            self::IN_PROGRESS => 'In Progress',
            self::DELIVERED => 'Delivered',
            self::COMPLETED => 'Completed',
            self::CANCELLED => 'Cancelled',
        };
    }

    /**
     * Valid transitions: current status => allowed next statuses.
     *
     * @return array<string, list<string>>
     */
    public static function transitions(): array
    {
        return [
            self::PENDING->value => [self::PAID->value, self::CANCELLED->value],
            self::PAID->value => [self::IN_PROGRESS->value, self::COMPLETED->value, self::CANCELLED->value],
            self::IN_PROGRESS->value => [self::DELIVERED->value, self::COMPLETED->value, self::CANCELLED->value],
            self::DELIVERED->value => [self::COMPLETED->value, self::CANCELLED->value],
            self::COMPLETED->value => [],
            self::CANCELLED->value => [],
        ];
    }

    public function canTransitionTo(self|string $target): bool
    {
        $targetValue = $target instanceof self ? $target->value : $target;

        return in_array($targetValue, self::transitions()[$this->value] ?? [], true);
    }
}
