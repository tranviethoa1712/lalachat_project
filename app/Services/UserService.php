<?php

namespace App\Services;

use App\Models\Message;
use App\Models\User;

class UserService
{
    public $currentUserId;
    public function __construct()
    {   
        $this->currentUserId = auth()->id();
    }

    /**
     * Services of Message
     */
    public function getMessageByUser($user)
    {
        $message = Message::where('sender_id', $this->currentUserId)
        ->where('receiver_id', $user->id)
        ->orWhere('sender_id', $user->id)
        ->where('receiver_id', $this->currentUserId)
        ->latest()
        ->paginate(10);

        return $message;
    }

    public function getMessageByGroup($group)
    {
        $message = Message::where('group_id', $group->id)
        ->latest()
        ->paginate(10);

        return $message;
    }

    public function getOlderMessages($message)
    {
        if($message->group_id) {
            $messages = Message::where('created_at', '<', $message->created_at)
            ->where('group_id', $message->group_id)
            ->latest()
            ->paginate(10);
        } else {
            $messages = Message::where('created_at', '<', $message->created_at)
                ->where(function ($query) use ($message) {
                    $query->where('sender_id', $message->sender_id)
                    ->where('receiver_id', $message->receiver_id)
                    ->orWhere('sender_id', $message->receiver_id)
                    ->where('receiver_id', $message->sender_id);
                })
                ->latest()
                ->paginate(10);
        }

        return $messages;
    }
}