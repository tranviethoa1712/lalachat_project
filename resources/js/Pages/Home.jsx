import { Head } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import ChatLayout from '@/Layouts/ChatLayout';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ChatBubbleLeftRightIcon } from '@heroicons/react/24/solid';
import MessageItem from '@/Components/App/MessageItem';
import ConversationHeader from '@/Components/App/ConversationHeader';
import MessageInput from '@/Components/App/MessageInput';
import { useEventBus } from '@/EventBus';
import axios from 'axios';
import AttachmentPreviewModal from '@/Components/App/AttachmentPreviewModal';

function Home({ selectedConversation = null, messages = null }) {
    console.log(messages, messages);
    const [ localMessages, setLocalMessages ] = useState([]);
    const messagesCtrRef = useRef(null);
    const loadMoreIntersect = useRef(null);
    const { on } = useEventBus();
    const [noMoreMessages, setNoMoreMessages] = useState([]);
    const [scrollFromBottom, setScrollFromBottom] = useState([]);
    const [showAttachmentPreview, setShowAttachmentPreview] = useState(false);
    const [previewAttachment, setPreviewAttachment] = useState({});

    const messageCreated = (message) => {
        if(
            selectedConversation
            && selectedConversation.is_group 
            && selectedConversation.id == message.group_id) 
            {
                setLocalMessages((prevMessages) => [...prevMessages, message]);
        }
        if(
            selectedConversation
            && selectedConversation.is_user
            && (selectedConversation.id == message.sender_id ||
                 selectedConversation.id == message.receiver_id)) 
            {
                setLocalMessages((prevMessages) => [...prevMessages, message]);
        }
    }

    /**
     * useCallback(fn, dependencies): The function value that you want to cache
     * React will give you the same function again if the dependencies have not changed since the last render
     * Otherwise, it will give you the function that you have passed during the current render, and store it in case it can be reused later
     * React will not call your function. The function is returned to you so you can decide when and whether to call it
     */
    const loadMoreMessages = useCallback(() => {
        // Find the first message object
        const firstMessage = localMessages[0];
        axios
            .get(route("message.loadOlder", firstMessage.id))
            .then(({ data }) => {
               if (data.data.length === 0) {
                setNoMoreMessages(true);
                return
               }

               /**
                * Calculate how much is scrolled from bottom and
                * scroll to the same position from bottom after messages are loaded
                * scrollHeight: get total height of scroll div
                * scrollTop: get current pixels of div is scrolled
                * clientHeight: the 'viewable' height of an element in pixels, including padding, but not the border, scrollbar or margin
                */
               const scrollHeight = messagesCtrRef.current.scrollHeight;
               const scrollTop = messagesCtrRef.current.scrollTop;
               const clientHeight = messagesCtrRef.current.clientHeight;
               const tmpScrollFromBottom = scrollHeight - scrollTop - clientHeight;
               setScrollFromBottom(scrollHeight - scrollTop - clientHeight); // ex:900px - 0px - 300px = 600px

               setLocalMessages((prevMessages) => {
                    return [...data.data.reverse(), ...prevMessages];
               })
            });
    }, [localMessages]);

    const onAttachmentClick = (attachments, index) => {
        setPreviewAttachment({
            attachments, index
        });
        setShowAttachmentPreview(true);
    }

    useEffect(() => {
        setTimeout(() => {
            // add scroll includes overflow hidden elements by reference to a DOM nodes and use API browser to set
            if (messagesCtrRef.current) {
                messagesCtrRef.current.scrollTop = messagesCtrRef.current.scrollHeight;
            }
        }, 10);

        const offCreated = on('message.created', messageCreated);

        setScrollFromBottom(0);
        setNoMoreMessages(false);

        return () => {
            // React cleans up effects from the previous render before running the effects next time
            offCreated();
        };

    }, [selectedConversation]);

    useEffect(() => {
        setLocalMessages(messages ? messages.data.reverse() : []);
    }, [messages]);

    useEffect(() => {
        // Recover scroll from bottom after messages are laoded
        // offsetHeight: returns the viewable height of an element (in pixels), including padding, border and scrollbar, but not the margin
        if (messagesCtrRef.current && scrollFromBottom !== null) {
            messagesCtrRef.current.scrollTop = 
            messagesCtrRef.current.scrollHeight -
            messagesCtrRef.current.offsetHeight -
            scrollFromBottom; // previous ex: 900px - 300 - 600 = 0px
        }

        if (noMoreMessages) {
            return;
        }

        /**
         * IntersectionObserver used:
         * if we scroll down the page the intersection ratio will be going up until it meets the designed threshold
         * and that's when the callback function is executed.
         * Can unobserve our target when the component unmounts (return in Effect Hook).
         */
        // const observer = new IntersectionObserver(
            
        // );
    }, [localMessages]);

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
                                <div ref={loadMoreIntersect}></div>
                                {localMessages.map((message) => (
                                    <MessageItem
                                        key={message.id}
                                        message={message}
                                        attachmentClick={onAttachmentClick}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                    {/* End Messages */}

                    <MessageInput conversation={selectedConversation} />
                </>
            )}
            
            {previewAttachment.attachments && (
                <AttachmentPreviewModal
                    attachments={previewAttachment.attachments}
                    index={previewAttachment.index}
                    show={showAttachmentPreview}
                    onClose={() => setShowAttachmentPreview(false)}
                />
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