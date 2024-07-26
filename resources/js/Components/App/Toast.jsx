import { useEventBus } from "@/EventBus";
import { useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";

export default function Toast({}) {
    const [toasts, setToasts] = useState([]);
    const { on } = useEventBus();

    useEffect(() => {
        on("toast.show", (message) => {
            const uuid = uuidv4();

            setToasts((oldToasts) => {
                return oldToasts
                    ? [...oldToasts, { message, uuid }]
                    : [{ message, uuid }];
            });

            // Remove toast every three seconds
            setTimeout(() => {
                setToasts((oldToasts) =>
                    oldToasts.filter((toast) => toast.uuid !== uuid)
                );
            }, 5000);
        });
    }, [on]);

    useEffect(() => {
        "toasts", toasts;
    }, [toasts]);

    return (
        <div className="toast toast-top toast-center min-w-[280px] w-full xs:w-auto">
            {toasts.map((toast, index) => (
                <div
                    key={toast.uuid}
                    className="alert alert-success py-3 px-4 text-gray-50 rounded-md"
                >
                    <span>{toast.message}</span>
                </div>
            ))}
        </div>
    );
}
