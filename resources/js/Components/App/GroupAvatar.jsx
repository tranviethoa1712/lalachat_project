import { UserIcon } from "@heroicons/react/24/solid";

const GroupAvatar = ({}) => {
    return (
        <>
            <div className="avatar placeholder">
                <div className="bg-blue-300 text-gray-800 rounded-full w-8">
                    <span className="text-xl">
                        <UserIcon className="w-4" />
                    </span>
                </div>
            </div>
        </>
    );
};

export default GroupAvatar; 