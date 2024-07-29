import { usePage } from "@inertiajs/react";
import UserAvatar from "./UserAvatar";
import { formatMessageDateLong } from "@/helpers";
import Markdown from "react-markdown";
import MessageAttachments from "./MessageAttachments";
import MessageOptionsDropdown from "./MessageOptionsDropdown";

const MessageItem = ({ message, attachmentClick }) => {
    const currentUser = usePage().props.auth.user;
    return (
        <div
            className={
                "chat " +
                (message.sender_id === currentUser.id
                    ? "chat-end"
                    : "chat-start")
            }
        >
            {<UserAvatar user={message.sender} />}

            <div className="chat-header">
                {message.sender_id !== currentUser.id
                    ? message.sender.name
                    : ""}
                <time className="text-xs opacity-50 ml-2">
                    {formatMessageDateLong(message.created_at)}
                </time>
            </div>
            <div
                className={
                    "chat-bubble relative " +
                    (message.sender_id === currentUser.id
                        ? " bg-base-200 text-gray-800"
                        : "bg-amber-900")
                }
            >
                {message.sender_id == currentUser.id && (
                    <MessageOptionsDropdown message={message} />
                )}
                <div className="chat-message">
                    <div className="chat-message-content">
                        <Markdown>{message.message}</Markdown>
                    </div>
                    {message.attachments && (
                        <MessageAttachments
                            attachments={message.attachments}
                            attachmentClick={attachmentClick}
                        />
                    )}
                </div>
            </div>
        </div>
    );
};

export default MessageItem;
