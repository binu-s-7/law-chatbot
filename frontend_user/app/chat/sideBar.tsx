'use client';

import Link from "next/link";
import SidebarChats from "@/app/chat/sideBarChats";
import NewChatButton from "@/app/chat/NewChatButton";


const Sidebar = ({}) => {

    return (
        <div>
            <div
                className="fixed top-0 left-0 w-1/5 h-screen bg-gray-800 overflow-auto justify-between flex flex-col ">
                <Link href={`/`} passHref>
                    <div className="flex items-center space-x-2 cursor-pointer">
                    <img src="/logo.png" alt="Logo" className="mx-auto" style={{ maxWidth: '150px', maxHeight:'150px' }}/>
                    </div>
                </Link>


                <div className="flex flex-col items-start justify-start p-5 space-y-4 text-white">
                    <NewChatButton/>

                    <Link href={`/files`} passHref>
                        <div className="flex items-center space-x-2 cursor-pointer">
                            {/*<div className="w-6 h-6 bg-gray-500"></div>*/}
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"
                                 className="w-6 h-6">
                                <path
                                    d="M5.625 1.5c-1.036 0-1.875.84-1.875 1.875v17.25c0 1.035.84 1.875 1.875 1.875h12.75c1.035 0 1.875-.84 1.875-1.875V12.75A3.75 3.75 0 0 0 16.5 9h-1.875a1.875 1.875 0 0 1-1.875-1.875V5.25A3.75 3.75 0 0 0 9 1.5H5.625Z"/>
                                <path
                                    d="M12.971 1.816A5.23 5.23 0 0 1 14.25 5.25v1.875c0 .207.168.375.375.375H16.5a5.23 5.23 0 0 1 3.434 1.279 9.768 9.768 0 0 0-6.963-6.963Z"/>
                            </svg>
                            <span>Manage Files</span>
                        </div>
                    </Link>

                </div>

                <div className="flex-1 overflow-auto">
                    <SidebarChats/>
                </div>
            </div>
        </div>
    );
};

export default Sidebar;