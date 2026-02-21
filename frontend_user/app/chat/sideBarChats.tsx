'use client';

import {createClientComponentClient} from "@supabase/auth-helpers-nextjs";
import {Database} from "@/types/supabase";
import {useContext, useEffect, useState} from "react";
import {AuthContext} from "@/components/AuthProvider";
import {usePathname, useRouter} from 'next/navigation';

const SidebarChats = ({}) => {
    const supabase = createClientComponentClient<Database>();
    const [chatSessions, setChatSessions] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const {user} = useContext(AuthContext);
    const router = useRouter();
    const pathname = usePathname();
    const [editingSessionId, setEditingSessionId] = useState(null);
    const [newName, setNewName] = useState('');

    useEffect(() => {
        const fetchChatSessions = async () => {
            setIsLoading(true);
            const {data, error} = await supabase
                .from('chat_session')
                .select('*')
                .eq('user_id', user.id)
                .order('created_date', {ascending: false})

            if (error) {
                console.error('Error fetching chat sessions:', error);
            } else {
                setChatSessions(data);
            }
            setIsLoading(false);
        };

        // Call the fetch function
        fetchChatSessions();
    }, [pathname]); // Dependency array ensures this effect runs only once or when user.id changes


    const deleteSession = async (sessionId) => {
        setIsLoading(true);
        const {error} = await supabase
            .from('chat_session')
            .delete()
            .eq('chat_id', sessionId);

        if (error) {
            console.error('Error deleting chat session:', error);
        } else {
            // Remove the session from local state
            setChatSessions(prevSessions => prevSessions.filter(session => session.chat_id !== sessionId));
        }
        setIsLoading(false);
    };

    const renameSession = async (sessionId) => {
        setIsLoading(true);
        const {error} = await supabase
            .from('chat_session')
            .update({chat_name: newName})
            .eq('chat_id', sessionId);

        if (error) {
            console.error('Error updating chat session name:', error);
        } else {
            // Update the session name in local state
            setChatSessions(prevSessions => prevSessions.map(session => {
                if (session.chat_id === sessionId) {
                    return {...session, chat_name: newName};
                }
                return session;
            }));
        }
        setEditingSessionId(null); // Exit edit mode
        setIsLoading(false);
    };


    if (isLoading) {
        return <div>Loading chat sessions...</div>;
    }


    return (
        <div>
            <div className="p-2">
                {chatSessions.length > 0 ? (
                    chatSessions.map((session) => (
                        <div key={session.chat_id} className="group p-2 flex items-center cursor-pointer">
                            {editingSessionId === session.chat_id ? (
                                <div className="flex items-center">
                                    <input
                                        type="text"
                                        value={newName}
                                        onChange={(e) => setNewName(e.target.value)}
                                        className="text-black font-bold max-w-[calc(100%-4rem)] "
                                    />
                                    <button onClick={() => renameSession(session.chat_id)}
                                            className="ml-2 text-green-500 hover:text-green-700 outline-green-600">
                                        {/* Save SVG here */}
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                                             strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                                            <path strokeLinecap="round" strokeLinejoin="round"
                                                  d="m4.5 12.75 6 6 9-13.5"/>
                                        </svg>
                                    </button>
                                </div>
                            ) : (
                                <>
                                    <div
                                        className="flex-1 overflow-hidden group-hover:max-w-[calc(100%-4rem)] transition-all duration-100">
                                        <div className="text-white truncate"
                                             onClick={() => router.push(`/chat/${session.chat_id}`)}>
                                            {session?.chat_name || session?.chat_id}
                                        </div>
                                    </div>
                                    <div
                                        className="absolute right-2 transform opacity-0 group-hover:opacity-100 transition-opacity duration-100">
                                        <button onClick={() => setEditingSessionId(session.chat_id)}
                                                className="text-blue-300 hover:text-blue-500 mr-2">
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                                                 strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                                                <path strokeLinecap="round" strokeLinejoin="round"
                                                      d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10"/>
                                            </svg>
                                        </button>
                                        <button onClick={() => deleteSession(session.chat_id)}
                                                className="text-red-300 hover:text-red-500">
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                                                 strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                                                <path strokeLinecap="round" strokeLinejoin="round"
                                                      d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"/>
                                            </svg>
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    ))
                ) : (
                    <p>No chat sessions available.</p>
                )}
            </div>
        </div>
    );


}

export default SidebarChats;