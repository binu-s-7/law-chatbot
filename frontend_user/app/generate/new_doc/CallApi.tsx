'use client';

import {createClientComponentClient} from "@supabase/auth-helpers-nextjs";
import {Database} from "@/types/supabase";
import React, {useContext, useEffect, useState} from "react";
import {AuthContext} from "@/components/AuthProvider";
import {useWorkFlow} from "@/app/generate/new_doc/WorkflowContext";
import {useRouter} from "next/navigation";

function formatTextWithLineBreaks(text) {
    return text.split('\n').map((line, index) => (
        <React.Fragment key={index}>
            {line}
            <br/>
        </React.Fragment>
    ));
}


async function fetchFinalDoc(template: string, placeholder_data: string) {
    const bodyData = {
        template,
        placeholder_data
    };

    console.log('bodyData', bodyData);

    const response = await fetch('http://127.0.0.1:9000/finalize_doc', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(bodyData),
    });

    const data = await response.json();
    console.log('response', data);
    return data.final_doc;
}


export default function CallApi({params}: { params: { id: string } }) {
    const supabase = createClientComponentClient<Database>();
    const [isLoading, setIsLoading] = useState(true);
    const [projects, setProjects] = useState([]);
    const [error, setError] = useState('');
    const [inputData, setInputData] = React.useState("");
    const [fileInfo, setFileInfo] = React.useState("");
    const [entityInfo, setEntityInfo] = React.useState("");
    const [name, setName] = useState('');

    const {template, formData, document, pickTemplate, submitFormData} = useWorkFlow();

    const {accessToken, user} = useContext(AuthContext);
    const router = useRouter();


    const handleNameChange = (e) => {
        setName(e.target.value); // Update the name state when the text box value changes
    };

    const sendToDB = async () => {

        console.log("sending to db")
        const {data, error} = await supabase
            .from('generated_docs')
            .insert([
                {
                    user_id: user.id,
                    name: name,
                    template_id: template.template_id,
                    content: fileInfo
                },
            ])
            .select()

        const doc_id = data[0].doc_id;
        console.log("data", doc_id);

        router.push(`/generate/${doc_id}`)
    }

    useEffect(() => {
        const fetchData = async () => {
            if (!user) return;

            const {data, error} = await supabase
                .from('doc_templates')
                .select()
            // .eq('user_id', user.id);

            if (error) {
                console.error("Error fetching projects:", error);
                setError('Failed to fetch projects.');
            } else {
                setProjects(data);
                console.log(data);
                console.log(projects);
            }
            setIsLoading(false);
        };

        fetchData();
    }, [user]); // Dependency on user to refetch when user changes

    const handleInputChange = (e) => {
        setInputData(e.target.value);
    };


    return (
        <div className="flex h-screen">

            <div className="w-2/3 h-full p-4 overflow-auto">
                <div className="text-2xl text-white">Template</div>
                <div className="bg-white p-4 shadow rounded">
                    <p>{formatTextWithLineBreaks(template.content)}</p> {/* Assuming 'content' is the text of your document */}
                </div>
            </div>

            <div className="w-2/3 h-full p-4 overflow-auto">
                <div className="text-2xl text-white">Context</div>
                <div className="bg-white p-4 shadow rounded">
                    <p>{formatTextWithLineBreaks(formData.inputData)}</p> {/* Assuming 'content' is the text of your document */}
                </div>
            </div>

            <div className="w-1/3 h-full bg-gray-100 p-4 overflow-auto">
                <div className="text-2xl mb-3">Created Document</div>
                <div>
                    <button onClick={async () => {
                        const file_info = await fetchFinalDoc(template.content, formData.inputData);
                        console.log('file_info', file_info);
                        setFileInfo(file_info)
                    }}
                            className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mb-3"
                    >Get File Info
                    </button>
                </div>
                <div>
                    {formatTextWithLineBreaks(fileInfo)}
                </div>

                <input
                    type="text"
                    value={name}
                    onChange={handleNameChange}
                    placeholder="Enter document name"
                    className="w-full px-4 py-2 text-black rounded mb-3"
                />

                <button onClick={sendToDB}
                        className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mb-3"
                >Finalize
                </button>
            </div>
        </div>
    );
}
