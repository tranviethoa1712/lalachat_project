export const formatMessageDateLong = (date) => {
    const now = new Date();
    const inputDate = new Date(date);

    if (isToday(inputDate)) {
        return inputDate.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit"
        });
    } else if (isYesterday(inputDate)) {
        return (
            "Yesterday " + 
            inputDate.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit"
            })
        )
    } else if (inputDate.getFullYear() === now.getFullYear()) {
        return inputDate.toLocaleDateString([], {
            day: "2-digit",
            month: "short"
        });
    } else {
        return inputDate.toLocaleDateString();
    }
};

export const formatMessageDateShort = (date) => {
    const now = new Date();
    const inputDate = new Date(date);

    if(isToday(inputDate)) {
        return inputDate.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit"
        });
    } else if (isYesterday(inputDate)) {
        return "Yesterday";
    } else if (inputDate.getFullYear() === now.getFullYear()) {
        return inputDate.toLocaleDateString([], {
            day: "2-digit",
            month: "short"
        })
    } else {
        return inputDate.toLocaleDateString();
    }
}

export const isToday = (date) => {
    const today = new Date();
    return (
        date.getDate() === today.getDate() &&
        date.getMonth() === today.getMonth() &&
        date.getFullYear() === today.getFullYear()
    );
};
export const isYesterday = (date) => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    return (
        date.getDate() === yesterday.getDate() &&
        date.getMonth() === yesterday.getMonth() &&
        date.getFullYear() === yesterday.getFullYear()
    );
}

export const isImage = (attachment) => {
    let mime = attachment.mime || attachment.type;
    mime = mime.split("/");
    return mime[0].toLowerCase() === "image";
}

export const isVideo = (attachment) => {
    let mime = attachment.mime || attachment.type;
    mime = mime.split("/");
    return mime[0].toLowerCase() === "video";
};

export const isAudio = (attachment) => {
    let mime = attachment.mime || attachment.type;
    mime = mime.split("/");
    return mime[0].toLowerCase() === "audio";
};

export const isPDF = (attachment) => {
    let mime = attachment.mime || attachment.type;
    return mime === "application/pdf";
};

export const isPreviewable = (attachment) => {
    return (
        isImage(attachment) ||
        isVideo(attachment) ||
        isAudio(attachment) ||
        isPDF(attachment)
    );
};

/**
 * for example: a file with 50000 bytes
 * while(50000 >= 1024)
 * loop 1
 * 50000 / 1024 = 48.828125
 * i = 1
 * end loop bcz size not >= k (48.828125 not >= 1024)
 * 
 * return (parseFloat(48.828125.toFixed(2)) 48.82 (sizes[1]) KB => 48.82KB)
 */
export const formatBytes = (bytes, decimals = 2) => {
    if (bytes === 0) return "0 bytes";

    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ["Bytes", "KB", "MB", "GB"];

    let i = 0;
    let size = bytes;
    while(size >= k) {
        size /= k;
        i++;
    }

    return parseFloat(size.toFixed(dm)) + " " + sizes[i];
}
