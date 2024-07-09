<?php

namespace App\Http\Controllers;

use App\Events\SocketMessage;
use App\Http\Requests\StoreMessageRequest;
use App\Http\Resources\MessageAttachmentResource;
use App\Http\Resources\MessageResource;
use App\Http\Resources\UserResource;
use App\Models\Conversation;
use App\Models\Group;
use App\Models\Message;
use App\Models\MessageAttachment;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class MessageController extends Controller
{
    public function byUser(User $user)
    {
        $messages = Message::where('sender_id', auth()->id())
        ->where('receiver_id', $user->id)
        ->orWhere('sender_id', $user->id)
        ->where('receiver_id', auth()->id())
        ->latest()
        ->paginate(10);
        
        return inertia('Home', [    
            'selectedConversation' => $user->toConversationArray(),
            'messages' => MessageResource::collection($messages) 
        ]);
    }

    public function byGroup(Group $group)
    {
        $message = Message::where('group_id', $group->id)
        ->latest()
        ->paginate(10);

        return inertia('Home', [
            'selectedConversation' => $group->toConversationArray(),
            'messages' => $message
        ]);
    }

    public function loadOlder(Message $message)
    {
        // Load older messages that are older than the given message, sort them by the lastest
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

        return MessageResource::collection($messages);
    }

    /**
     * Store a newly created resource in storage
     */
    public function store(StoreMessageRequest $request)
    {
        $data = $request->validated();
        $data['sender_id'] = auth()->id();
        $receiverId = $data['receiver_id'] ?? null;
        $groupId = $data['group_id'] ?? null;

        $files = $data['attachments'] ?? [];

        $message = Message::create($data);

        $attachments = [];        
        if($files) {
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
        if($groupId) {
            Group::updateGroupWithMessage($groupId, $message);
        }

        // Reverb Laravel push the infomation to browser and tell that the message was received
        SocketMessage::dispatch($message);

        return new MessageResource($message);
    }


    /**
     * Remove the specified resource from storage
     */
    public function destroy(Message $message)
    {
        // Check if the user is the owner of the message
        if($message->sender_id !== auth()->id()) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $message->delete();

        return response('', 204);
    }
}
