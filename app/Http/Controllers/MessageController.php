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
use App\Models\User;
use App\Services\UserService;


class MessageController extends Controller
{
    private $userService;
    public function __construct() 
    {
        $this->userService = new UserService();
    }
    public function byUser(User $user)
    {
        $message = $this->userService->getMessageByUser($user);
        
        return inertia('Home', [    
            'selectedConversation' => $user->toConversationArray(),
            'messages' => MessageResource::collection($message) 
        ]);
    }

    public function byGroup(Group $group)
    {
        $message = $this->userService->getMessageByGroup($group);
        return inertia('Home', [
            'selectedConversation' => $group->toConversationArray(),
            'messages' => MessageResource::collection($message)
        ]);
    }

    public function loadOlder(Message $message)
    {
        // Load older messages that are older than the given message, sort them by the lastest
        $messages = $this->userService->getOlderMessages($message);

        return MessageResource::collection($messages);
    }

    /**
     * Store a newly created resource in storage
     */
    public function store(StoreMessageRequest $request)
    {
        $data = $request->validated();
        $message = $this->userService->storeMessageProcess($data);

        return new MessageResource($message);
    }


    /**
     * Remove the specified resource from storage
     */
    public function destroy(Message $message)
    {
        $lastMessage = $this->userService->destroyMessageProcess($message);

        return response()->json(['message' => $lastMessage ? new MessageResource($lastMessage) : null]);
    }
}