import { Head } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import ChatLayout from '@/Layouts/ChatLayout';
import { useEffect, useRef, useState } from 'react';
import { ChatBubbleLeftRightIcon } from '@heroicons/react/24/solid';
import MessageItem from '@/Components/App/MessageItem';
import ConversationHeader from '@/Components/App/ConversationHeader';

function Home({ selectedConversation = null, messages = null }) {
    if (messages) {
        console.log('messages', messages)
    }
    const [ localMessages, setLocalMessages ] = useState([]);
    const messagesCtrRef = useRef(null);

    useEffect(() => {
        setLocalMessages(messages ? messages.data : [])
    }, [messages]);

    if (localMessages) {
        console.log('localMessages', localMessages)
    }
    return (
        <>
            {!messages && (
                <div className="flex flex-col gap-8 justify-center items-center text-center h-full opacity-35">
                    <div className='text-2xl md:text-4xl p-16 text-slate-200'>
                        Please select conversation to see messages
                        <ChatBubbleLeftRightIcon className='w-32 h-32 inline-block' />
                    </div>
                </div>
            )}
            {messages && (
                <>
                    <ConversationHeader
                        selectedConversation={selectedConversation}
                    />
                    <div 
                        ref={messagesCtrRef}
                        className='flex-1 overflow-y-auto p-5'
                    >
                        {/* Messages */}

                        {localMessages.length === 0 && (
                            <div className='flex justify-center items-center h-full'>
                                <div className='text-lg text-slate-200'>
                                    No messages found
                                </div>
                            </div>
                        )}
                        {localMessages.length > 0 && (
                            <div className='flex-1 flex flex-col'>
                                {localMessages.map((message) => (
                                    <MessageItem
                                        key={message.id}
                                        message={message}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                    {/* <MessageInput conversation={selectedConversation} /> */}
                </>
            )}
        </>
    );
}
// This is Persistent layouts
Home.layout = (page) => {
    return (
        <AuthenticatedLayout
            user={page.props.auth.user}
        >   
            <ChatLayout children={page}>
            </ChatLayout>
        </AuthenticatedLayout>
    )
}

export default Home;