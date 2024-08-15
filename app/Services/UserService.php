<?php

namespace App\Services;

use App\Events\SocketMessage;
use App\Models\Conversation;
use App\Models\Group;
use App\Models\Message;
use App\Models\MessageAttachment;
use App\Models\User;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

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
        if ($message->group_id) {
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

    public function storeMessageProcess($data)
    {
        $data['sender_id'] = auth()->id();
        $receiverId = $data['receiver_id'] ?? null;
        $groupId = $data['group_id'] ?? null;

        $files = $data['attachments'] ?? [];

        $message = Message::create($data);
        $attachments = [];
        if ($files) {
            foreach ($files as $file) {
                $directory = 'attachments/' . Str::random(32);
                Storage::makeDirectory($directory);

                $model = [
                    'message_id' => $message->id,
                    'name' => $file->getClientOriginalName(),
                    'mime' => $file->getClientMimeType(),
                    'size' => $file->getSize(),
                    'path' => $file->store($directory, 'public'),
                ];
                $attachment = MessageAttachment::create($model);
                $attachments[] = $attachment;
            }

            $message->attachments = $attachments;
        }

        // Update last message id in conversation of two user if receiver id exists
        if ($receiverId) {
            Conversation::updateConversationWithMessage($receiverId, auth()->id(), $message);
        }
        // Update last message id in Group if group id exists
        if ($groupId) {
            Group::updateGroupWithMessage($groupId, $message);
        }

        // Reverb Laravel push the infomation to browser and tell that the message was received
        SocketMessage::dispatch($message);

        return $message;
    }

    public function destroyMessageProcess($message)
    {
        $group = null;
        $conversation = null;
        $lastMessage = null;
        // Check if the user is the owner of the message
        if ($message->sender_id !== auth()->id()) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        // Check if the message is the group message
        if ($message->group_id) {
            $group = Group::where('last_message_id', $message->id)->first();
        } else {
            $conversation = Conversation::where('last_message_id', $message->id)->first();
        }

        // Target to response deleted message to client
        if ($group) {
            $group = Group::find($group->id);
            $lastMessage = $group->lastMessage;
        } else if ($conversation) {
            $conversation = Conversation::find($conversation->id);
            $lastMessage = $conversation->lastMessage;
        }
        $message->delete();

        return $lastMessage;
    }
}
