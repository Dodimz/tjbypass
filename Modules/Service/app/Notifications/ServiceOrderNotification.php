<?php

namespace Modules\Service\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class ServiceOrderNotification extends Notification
{
    use Queueable;

    /**
     * Create a new notification instance.
     */
    public function __construct(private array $data)
    {
        //
    }

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['database'];
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        $payload = [
            'title' => $this->data['title'],
        ];

        if (! empty($this->data['description'])) {
            $payload['body'] = $this->data['description'];
        }

        if (! empty($this->data['url'])) {
            $payload['url'] = config('app.url').$this->data['url'];
        }

        return $payload;
    }
}
