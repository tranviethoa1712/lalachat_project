import { usePage } from "@inertiajs/react";
import { useEffect, useState } from "react";

const ChatLayout = ({ children }) => {
    // usePage is a custom hook provided by Inertiajs to make the possibility of accessing server-side shared data
    const page = usePage();
    const conversations = page.props.conversations;
    const selectedConversation = page.props.selectedConversation;
    const [localConversations, setLocalConversations] = useState([]);
    const [sortedConversations, setSortedConversations] = useState([]);

    const [onlineUsers, setOnlineUsers] = useState({});

    const isUserOnline = (userId) => onlineUsers[userId];

    console.log("conversations", conversations)
    console.log("selectedConversation", selectedConversation)

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
                }
            })
        );
    }, [conversations]);

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
                    console.log('prev', updatedUSers);
                    updatedUSers[user.id] = user; 
                    console.log('now', updatedUSers);
                    return updatedUSers;
                })
            })
            // whenever somebody leaves that channel The user will get info right here
            .leaving((user) => {
                const updatedUSers = { ...prevOnlineUsers };
                    console.log('prev', updatedUSers);
                    updatedUSers[user.id] = user; 
                    console.log('now', updatedUSers);
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
            
        </>
    )
}

export default ChatLayout;