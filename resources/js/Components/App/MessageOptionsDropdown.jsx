import { useEventBus } from "@/EventBus";
import {
    Menu,
    MenuButton,
    MenuItem,
    MenuItems,
    Transition,
} from "@headlessui/react";
import {
    EllipsisVerticalIcon,
    LockOpenIcon,
    LockClosedIcon,
    UserIcon,
    TrashIcon,
} from "@heroicons/react/24/solid";
import axios from "axios";
import { Fragment } from "react";

export default function MessageOptionsDropdown({ message }) {
    const { emit } = useEventBus();
    ("Mess Dropdown");
    const onMessageDelete = () => {
        // Send axios post request to delete message and show notification on success
        axios
            .delete(route("message.destroy", message.id))
            .then((response) => {
                emit("message.deleted", {
                    message,
                    prevMessage: response.data.message,
                });
            })
            .catch((err) => {
                console.error(err);
            });
    };

    return (
        <div className="absolute right-full text-black top-1/2 -translate-y-1/2 z-10">
            <Menu as="div" className="relative inline-block text-left">
                <div>
                    <MenuButton
                        className={
                            "flex justify-center items-center w-8 h-8 rounded-full hover:bg-black/40"
                        }
                    >
                        <EllipsisVerticalIcon className="h-5 w-5" />
                    </MenuButton>
                </div>
                <Transition
                    as={Fragment}
                    enter="transition ease-out duration-100"
                    enterFrom="transform opacity-0 scale-95"
                    enterTo="transform opacity-100 scale-100"
                    leave="transform ease-in duration-75 scale-95"
                    leaveFrom="transform opacity-100 scale-100"
                    leaveTo="transform opacity-0 scale-95"
                >
                    <MenuItems className="absolute right-0 mt-2 w-48 rounded-md bg-red-500 shadow-lg z-[100]">
                        <div className="px-1 py-1">
                            <MenuItem>
                                <button
                                    onClick={onMessageDelete}
                                    className={`bg-red-600 text-white group flex w-full items-center rounded-md px-2 py-2 text-sm`}
                                >
                                    <TrashIcon className="w-4 h-4 mr-2" />
                                    Delete
                                </button>
                            </MenuItem>
                        </div>
                    </MenuItems>
                </Transition>
            </Menu>
        </div>
    );
}
