import { usePage } from "@inertiajs/react";
import { useEffect, useState } from "react";
import {PencilSquareIcon} from "@heroicons/react/24/solid";
import TextInput from "@/Components/TextInput";
import ConversationItem from "@/Components/App/ConversationItem";


const ChatLayout = ({ children }) => {
    // usePage is a custom hook provided by Inertiajs to make the possibility of accessing server-side shared data
    const page = usePage();
    const conversations = page.props.conversations;
    const selectedConversation = page.props.selectedConversation;
    const [localConversations, setLocalConversations] = useState([]);
    const [sortedConversations, setSortedConversations] = useState([]);

    const [onlineUsers, setOnlineUsers] = useState({});
    
    // Check online users
    const isUserOnline = (userId) => onlineUsers[userId];

    const onSearch  = (ev) => {
        const search = ev.target.value.toLowerCase();
        setLocalConversations(
            conversations.filter((conversation) => {
                return conversation.name.toLowerCase().includes(search);
            })
        )
    }

    useEffect(() => {
        setSortedConversations(
            localConversations.sort((a, b) => {
                if (a.blocked_at && b.blocked_at) {
                    return a.blocked_at > b.blocked_at ? 1 : -1;
                } else if (a.blocked_at) {
                    return 1;
                } else if (b.blocked_at) {
                    return -1;
                }

                if(a.last_message_date && b.last_message_date) {
                    return b.last_message_date.localeCompare(
                        a.last_message_date
                    );
                } else if (a.last_message_date) {
                    return -1;
                } else if (b.last_message_date) {
                    return 1;
                } else {
                    return 0;
                }
            })
        );
    }, [localConversations]);

    useEffect(() => {
        setLocalConversations(conversations);
    }, [conversations]);

    useEffect(() => {
        // controll who online or offline
        // this is broadcasting laravel, link(https://laravel.com/docs/11.x/broadcasting#:~:text=Pusher%20Channels-,Laravel%20Echo%20is%20a%20JavaScript%20library%20that%20makes%20it%20painless,subscriptions%2C%20channels%2C%20and%20messages.)
        Echo.join('online')
            // whenever the user connect to chanel, the user is going to get all the other connected users right here
            .here((users) => {
                // Object.fromEntries() transforms a list of key-value pairs into an object.
                const onlineUsersObj = Object.fromEntries(users.map((user) => [user.id, user]));

                setOnlineUsers((prevOnlineUsers) => {
                    return { ...prevOnlineUsers, ...onlineUsersObj }
                });
            })
            // whenever somebody connects to the chanel That user come right here
            .joining((user) => {
                setOnlineUsers((prevOnlineUsers) => {
                    const updatedUSers = { ...prevOnlineUsers };
                    updatedUSers[user.id] = user; 
                    return updatedUSers;
                })
            })
            // whenever somebody leaves that channel The user will get info right here
            .leaving((user) => {
                const updatedUSers = { ...prevOnlineUsers };
                    updatedUSers[user.id] = user; 
                    return updatedUSers;
            }).error((error) => {
                console.log("error", error);
            });

            return () => {
                Echo.leave("online"); // user logout event
            };
    }, []);

    return (
        <>
            <div className="flex-1 w-full flex overflow-hidden">
                <div className={`transition-all w-full sm:w-[220px] md:w-[300px] bg-slate-800 
                flex flex-col overflow-hidden ${
                    selectedConversation ? "-ml-[100%] sm:ml-0" : ""
                }`}>
                    <div className="flex items-center justify-between py-2 px-3 text-xl text-gray-200 font-medium">
                        My Conversations
                        <div className="tooltip tooltip-left" data-tip="Create new Group">
                            <button className="text-gray-400 hover:text-gray-200"
                            >
                                <PencilSquareIcon className="w-4 h-4 inline-block ml-2" />
                            </button>
                        </div>
                    </div>
                    <div className="p-3">
                        <TextInput 
                            onKeyUp={onSearch}
                            placeholder="Filter users and groups"
                            className="w-full"
                        />
                    </div>
                    <div className="flex-1 overflow-auto">
                        {sortedConversations && 
                            sortedConversations.map((conversation) => (
                                <ConversationItem
                                    key={`${conversation.is_group
                                            ? "group_"
                                            : "user_"
                                    }${conversation.id}`}
                                    conversation={conversation}
                                    online={!!isUserOnline(conversation.id)}
                                    selectedConversation={selectedConversation}
                                />
                            ))}
                    </div>
                </div>
                <div className="flex-1 flex flex-col overflow-hidden">
                    {children}
                </div>
            </div>
        </>
    )
}

export default ChatLayout;