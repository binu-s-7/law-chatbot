'use client';

import {createClientComponentClient} from "@supabase/auth-helpers-nextjs";
import {Database} from "@/types/supabase";
import React, {useContext, useEffect, useState} from "react";
import {AuthContext} from "@/components/AuthProvider";
import {Document, Packer, Paragraph, TextRun} from 'docx';

function truncateText(text, length) {
    if (text.length <= length) {
        return text;
    }
    return text.substring(0, length) + '...';
}


export default function ShowDocData({params}: { params: { id: string } }) {
    const supabase = createClientComponentClient<Database>();
    const [isLoading, setIsLoading] = useState(true);
    const [project, setProject] = useState(null);
    const [template, setTemplate] = useState(null);
    const [error, setError] = useState('');

    const {accessToken, user} = useContext(AuthContext);


    function downloadDoc() {
        const doc = new Document({
            sections: [
                {
                    properties: {},
                    children: [
                        new Paragraph({
                            children: [
                                new TextRun({
                                    text: project.name,
                                    bold: true,
                                    size: 48,
                                }),
                            ],
                            spacing: {
                                after: 400, // spacing after paragraph
                            },
                        }),
                        new Paragraph({
                            children: [
                                new TextRun({
                                    text: `Template: ${template.name}`,
                                    size: 32,
                                }),
                                new TextRun({
                                    text: `\nCreated Date: ${new Date(project.generated_at).toLocaleDateString()}`,
                                    size: 32,
                                }),
                            ],
                        }),
                        new Paragraph({
                            children: [
                                new TextRun({
                                    text: project.content,
                                    size: 24,
                                }),
                            ],
                            spacing: {
                                before: 400, // spacing before paragraph
                            },
                        }),
                    ],
                },
            ],
        });

        Packer.toBlob(doc).then(blob => {
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `${project.name}.docx`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        });
    }


    useEffect(() => {
        const fetchData = async () => {
            if (!user) return;

            console.log(params.doc_id);

            const {data: projectData, error: projectError} = await supabase
                .from('generated_docs')
                .select()
                .eq('doc_id', params.doc_id)
                .single(); // Fetches only one record

            if (projectError) {
                console.error("Error fetching project:", projectError);
                setError('Failed to fetch project.');
            } else if (projectData) {
                setProject(projectData);
                console.log("Project Data:", projectData);

                // Fetching template data based on the project's template_id
                const {data: templateData, error: templateError} = await supabase
                    .from('doc_templates')
                    .select()
                    .eq('template_id', projectData.template_id)
                    .single(); // Fetches only one record

                if (templateError) {
                    console.error("Error fetching template:", templateError);
                    setError('Failed to fetch template.');
                } else {
                    setTemplate(templateData);
                    console.log("Template Data:", templateData);
                }
            }
            setIsLoading(false);
        };

        fetchData();
    }, [user, params.id]); // Dependency on user and params.id

    return (
        <div className="min-h-screen bg-gray-900 p-8">
            <div className="text-3xl text-center text-white font-semibold py-6">Document Details</div>
            {isLoading ? (
                <p className="text-center text-blue-500">Loading...</p>
            ) : error ? (
                <p className="text-center text-red-500">{error}</p>
            ) : project && template ? (
                <div className="max-w-6xl mx-auto bg-gray-800 p-8 border border-gray-700 rounded-lg shadow-lg">
                    <div className="flex justify-between items-start mb-6">
                        <h2 className="text-3xl font-bold text-white">{project.name}</h2>
                        <button onClick={downloadDoc}
                                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                            Download
                        </button>
                    </div>
                    <div>
                        <p className="text-lg text-white">Template: <span
                            className="font-normal text-gray-300">{template.name}</span></p>
                        <p className="text-lg text-white">Created Date: <span
                            className="font-normal text-gray-300">{new Date(project.generated_at).toLocaleDateString()}</span>
                        </p>
                    </div>
                    <div
                        className="text-white text-lg leading-relaxed mb-6 mt-6">{project.content}</div>
                </div>

            ) : (
                <p className="text-center text-white">Project not found.</p>
            )}
        </div>
    );
}
