'use client';

import {createClientComponentClient} from "@supabase/auth-helpers-nextjs";
import {Database} from "@/types/supabase";
import React, {useContext, useEffect, useState} from "react";
import {AuthContext} from "@/components/AuthProvider";
import {useWorkFlow} from "@/app/generate/new_doc/WorkflowContext";

function formatTextWithLineBreaks(text) {
    return text.split('\n').map((line, index) => (
        <React.Fragment key={index}>
            {line}
            <br/>
        </React.Fragment>
    ));
}


async function fetchInfo(temp_id: number) {
    const bodyData = {
        temp_id,
    };

    console.log('bodyData', bodyData);

    const response = await fetch('http://127.0.0.1:9000/get_file_info', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(bodyData),
    });

    const data = await response.json();
    console.log('response', data);
    return data.file_info;
}

async function fetchEnitityInfo(current_questions: string, context: string) {
    const bodyData = {
        current_questions,
        context
    };

    console.log('bodyData', bodyData);

    const response = await fetch('http://127.0.0.1:9000/get_entity_info', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(bodyData),
    });

    const data = await response.json();
    console.log('response', data);
    return data.entity_info;
}


export default function GetInput({params}: { params: { id: string } }) {
    const supabase = createClientComponentClient<Database>();
    const [isLoading, setIsLoading] = useState(true);
    const [projects, setProjects] = useState([]);
    const [error, setError] = useState('');
    const [inputData, setInputData] = React.useState("");
    const [fileInfo, setFileInfo] = React.useState("");
    const [entityInfo, setEntityInfo] = React.useState("");

    const {template, formData, document, pickTemplate, submitFormData} = useWorkFlow();

    const {accessToken, user} = useContext(AuthContext);

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

    const handleSubmit = () => {
        // submitFormData({ ...template, inputData });
    };

    useEffect(() => {
        async function loadFileInfo() {
            setIsLoading(true);
            try {
                console.log("Calling Fetching..")
                const file_info = await fetchInfo(1);
                console.log('file_info', file_info);
                setFileInfo(file_info);
            } catch (error) {
                console.error('Failed to fetch file info:', error);
                setError('Failed to fetch file info.');
            }
            setIsLoading(false);
        }

        if (user) {
            loadFileInfo();
        }
    }, [user]);

    return (
        <div className="flex h-screen">
            <div className="w-1/3 h-full p-4 overflow-auto">
                {/*<div className=""></div>*/}
                {/* Here you might use a component from a library like react-pdf or Draft.js */}
                <div className="bg-white p-4 shadow rounded">
                    <p>{formatTextWithLineBreaks(template.content)}</p> {/* Assuming 'content' is the text of your document */}
                </div>
            </div>
            <div className="w-2/3 h-full bg-gray-100 p-4 overflow-auto">

                {/*    show extracted data with fetchInfo*/}
                {/*<div>*/}
                {/*    <button onClick={async () => {*/}
                {/*        const file_info = await fetchInfo(1);*/}
                {/*        console.log('file_info', file_info);*/}
                {/*        setFileInfo(file_info)*/}
                {/*    }}>Get File Info*/}
                {/*    </button>*/}
                {/*</div>*/}
                <div className="text-2xl mb-2">Answer These Question for Document Generation</div>
                <div>
                    {formatTextWithLineBreaks(fileInfo)}
                </div>
                <textarea
                    value={inputData}
                    onChange={handleInputChange}
                    className="w-full h-1/2 p-4 border rounded mt-5"
                    placeholder="Enter your input here"
                />
                {/*<button onClick={handleSubmit}*/}
                {/*        className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">*/}
                {/*    Submit*/}
                {/*</button>*/}
                <div>
                    <button onClick={async () => {
                        const entity_Info = await fetchEnitityInfo(fileInfo, inputData);
                        console.log('file_info', entity_Info);
                        setEntityInfo(entity_Info)
                    }}
                            className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                    >Submit
                    </button>
                </div>
                <div>
                    {formatTextWithLineBreaks(entityInfo)}
                </div>

                {/*    Button to submitFormData as entityInfo*/}
                <button onClick={async () => {
                    submitFormData({inputData});
                }}
                        className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                >Generate Document
                </button>

            </div>
        </div>
    );
}
