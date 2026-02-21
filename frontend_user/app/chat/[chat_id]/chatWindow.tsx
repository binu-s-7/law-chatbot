'use client';

import React, {useEffect, useRef, useState} from 'react';
import {createClientComponentClient} from "@supabase/auth-helpers-nextjs";
import {Database} from "@/types/supabase";
import {AuthContext} from "@/components/AuthProvider";
import {useRouter} from "next/navigation";
import ShowFilesChat from "@/app/files/showFilesChat";
import {ChatMessage} from "@/app/chat/[chat_id]/chatMessage";


interface ChatWindowProps {
    params: {
        id: string;
        chat_id?: string; // Assuming chat_id might be part of params based on your usage
    };
}

async function fetchAnswer(message: string, model: string, user_id: string, chat_id: string, files: any, advanced_mode: boolean) {
    const bodyData = {
        message,
        model,
        user_id,
        chat_id,
        files,
        advanced_mode
    };

    console.log("Body Data", bodyData);

    const response = await fetch('http://127.0.0.1:9000/chat_model', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(bodyData),
    });

    const data = await response.json();
    console.log('response', data.answer);
    return data.answer;

    // return "This is answer"
}


export default function ChatWindow({params}: ChatWindowProps) {
    const [imageData, setImageData] = useState(null);
    const [imageDataUrl, setImageDataUrl] = useState(null);
    const [currentFiles, setCurrentFiles] = useState({});

    const supabase = createClientComponentClient<Database>();

    const [isLoading, setIsLoading] = useState(true);
    const [chatData, setChatData] = useState([]); // Use state to hold server posts
    const [editedMessage, setEditedMessage] = useState(false);
    const [newMessageText, setNewMessageText] = useState('');

    const [lastMessage, setLastMessage] = useState(null);

    const [stillStreaming, setStillStreaming] = useState(false);

    const [currentLLM, setCurrentLLM] = useState<string>('gpt-3.5-turbo-0613');

    const [selectedFiles, setSelectedFiles] = useState([]);
    const [isAdvancedSearch, setIsAdvancedSearch] = useState(false);

    const [isMessageComplete, setIsMessageComplete] = useState(false);

    const messagesEndRef = useRef(null)


    const router = useRouter();


    // get user and accessToken from AuthProvider
    const {accessToken, user} = React.useContext(AuthContext);

    // console.log("params.id", params.chat_id)

    const handleImageUpload = (fileName, imageUrl) => {
        // Update the state with the new image URL
        setImageData(fileName)
        setImageDataUrl(imageUrl)
        // Add the new image URL to the current files like {file1: url1, file2: url2}
        setCurrentFiles({...currentFiles, [fileName]: imageUrl})
    };

    const removeImage = (fileUrlToRemove) => {
        const filteredFiles = Object.entries(currentFiles).reduce((acc, [key, value]) => {
            if (value !== fileUrlToRemove) {
                acc[key] = value;
            }
            return acc;
        }, {});

        setCurrentFiles(filteredFiles);
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView()
        // messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }


    useEffect(() => {
        console.log("Calling useEffect for get updated chat messages")
        // console.log("ServerPosts", ServerPosts);

        // if (messageTree) {
        const channel = supabase.channel('realtime chats')
            .on("postgres_changes", {
                    event: "INSERT",
                    schema: "public",
                    table: "chat_message"
                }, (payload) => {
                    console.log("Insert payload", payload.new);
                    setLastMessage(payload.new)
                    setNewMessageText('')
                }
            )
            .on('postgres_changes', {
                event: 'UPDATE',
                schema: 'public',
                table: 'chat_message',
            }, (payload) => {
                console.log("Update payload", payload.new);
            })
            .on('postgres_changes', {
                event: 'DELETE',
                schema: 'public',
                table: 'chat_message',
            }, (payload) => {
                console.log("Delete payload", payload.new);
            })
            .subscribe();

        return () => {
            console.log("Unsubscribing")
            supabase.removeChannel(channel)
        }
        // }
    }, [stillStreaming])


    const insertNewIntoSupabase = async () => {
        console.log("Inserting into Supabase")
        console.log("chat_id", params.chat_id)
        console.log("user_id", user.id)
        console.log("text", newMessageText)

        // if chatData is empty, insert root message
        if (chatData.length === 0) {
            console.log("rootMessageExist is true")
            const {data, error} = await supabase
                .from('chat_message')
                .insert([
                    {
                        chat_id: params.chat_id,
                        user_id: user.id,
                        text: newMessageText,
                    }
                ]);
            if (error) console.error('Error inserting into Supabase:', error);
            else console.log('Inserted into Supabase:', data);
        } else {
            // take the last message from chatData
            const lastMessage = chatData[chatData.length - 1];
            console.log("lastMessage", lastMessage);

            const {data, error} = await supabase
                .from('chat_message')
                .insert([
                    {
                        chat_id: params.chat_id,
                        user_id: user.id,
                        text: newMessageText,
                        previous_message_id: lastMessage.message_id
                    }
                ]);

            if (error) console.error('Error inserting into Supabase:', error);
            else console.log('Inserted into Supabase:', data);
        }

        const fetchData = async () => {
            setIsLoading(true);
            const {data, error} = await supabase.from('chat_message').select().eq('chat_id', params.chat_id)

            if (data && data.length > 0) {
                setChatData(data);
            } else {
                console.error("No LLM models found or error fetching models:", error);
            }
            setIsLoading(false);
        };

        await fetchData();
    };


    const insertNewLLMResponseIntoSupabase = async (llmResponse) => {
        console.log("Inserting into Supabase")
        console.log("chat_id", params.chat_id)
        console.log("text", llmResponse)

        const lastMessage = chatData[chatData.length - 1];
        console.log("lastMessage", lastMessage);

        // original_message_id -
        const {data, error} = await supabase
            .from('chat_message')
            .insert([
                {
                    chat_id: params.chat_id,
                    user_id: user.id,
                    text: llmResponse,
                    previous_message_id: lastMessage?.message_id,
                    by_ai: true
                }
            ]);

        // if (error) console.error('Error inserting into Supabase:', error);
        // else console.log('Inserted into Supabase:', data);
        console.log('Inserted into Supabase:', data);

        const fetchData = async () => {
            setIsLoading(true);
            const {data, error} = await supabase.from('chat_message').select().eq('chat_id', params.chat_id)

            if (data && data.length > 0) {
                setChatData(data);
            } else {
                console.error("No LLM models found or error fetching models:", error);
            }
            setIsLoading(false);
        };

        await fetchData();
    };

    useEffect(() => {
        // console.log("Calling useEffect for get initial chat messages")
        const fetchData = async () => {
            setIsLoading(true);
            const {data, error} = await supabase
                .from('chat_message')
                .select()
                .eq('chat_id', params.chat_id)

            // console.log("data", data);
            // console.log("error", error);

            if (data) {
                if (data.length > 0) {
                    // console.log("Data length", data.length);
                    setChatData(data);
                    // initializeOrUpdateTree(data);
                }
            }
            if (error) {
                console.error("Error fetching chat messages:", error);
            }
            setIsLoading(false);
        };

        fetchData();
    }, []);


    const handleSendClick = async () => {
        console.log("Send Clicked");

        console.log(newMessageText);
        await insertNewIntoSupabase();

        setStillStreaming(true);
        console.log("Start fetching Done");
        const respond = await fetchAnswer(newMessageText, currentLLM, user.id, params.chat_id, selectedFiles, isAdvancedSearch)
        console.log("Response", respond);
        setLastMessage(respond);
        console.log("Start fetching Done");
        setStillStreaming(false);

        if (respond !== "") {
            await insertNewLLMResponseIntoSupabase(respond);
        } else {
            console.log("No LLM response")
        }

        setStillStreaming(false);
    };

    if (isLoading) {
        return <div>Loading chat messages...</div>; // Display a loading message or spinner
    }

    return (
        <div className="flex bg-gray-500 h-screen">
            {/* Chat Area */}

            <div className="flex-1  py-5 overflow-y-auto  pb-44 scroll-auto">

                {/*Map Chat Data*/}
                {/*{chatData.map((message) => (*/}
                {/*    <div key={message.message_id} className="flex items-start space-x-2 mb-4">*/}
                {/*        <img src={'/profile_image.png'} alt="Stream"*/}
                {/*             className="w-10 h-10 rounded-full object-cover"/>*/}
                {/*        <div className="flex flex-col rounded bg-gray-100 p-2 shadow">*/}
                {/*            <div className="font-bold">{user.profile.username}</div>*/}
                {/*            <div className="message-content">{message.text}</div>*/}
                {/*        </div>*/}
                {/*    </div>*/}
                {/*))}*/}

                {chatData.map((message) => (
                    <ChatMessage key={message.message_id} message={message} username={user.profile.username}/>
                ))}


                {/*Input Bar*/}
                <div className="fixed bottom-0 bg-gray-600 w-4/5 border-t border-gray-300 p-3 ">

                    {/* Input for new message text */}
                    <ShowFilesChat params={params} selectedFiles={selectedFiles} setSelectedFiles={setSelectedFiles}/>

                    <textarea
                        value={newMessageText}
                        onChange={(e) => setNewMessageText(e.target.value)}
                        className="border w-full border-gray-300 text-sm rounded-md px-3 py-2 mr-2 focus:outline-none focus:ring focus:border-blue-300"
                        placeholder="Type your message..."
                        rows={5}
                    ></textarea>
                    <div className="flex justify-end items-center space-x-2">
                        {/*<button*/}
                        {/*    onClick={() => setSummerizeChatModelToggle(true)}*/}
                        {/*    className="transition-colors duration-300 text-white font-bold py-2 px-4 rounded-lg bg-green-500 hover:bg-green-700"*/}
                        {/*>*/}
                        {/*    Summerize*/}
                        {/*</button>*/}
                        {/* Button to add a new message */}
                        <button
                            onClick={handleSendClick}
                            className="py-3 bg-gray-900 text-sm hover:bg-gray-700 text-white font-bold rounded-lg px-4 "
                        >
                            Get Response
                        </button>
                    </div>
                </div>

                <div style={{marginBottom: 100}} ref={messagesEndRef}/>

            </div>
        </div>
    );
}
