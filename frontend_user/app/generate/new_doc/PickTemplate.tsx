'use client';

import {createClientComponentClient} from "@supabase/auth-helpers-nextjs";
import {Database} from "@/types/supabase";
import Link from "next/link";
import React, {useContext, useEffect, useState} from "react";
import {AuthContext} from "@/components/AuthProvider";
import {useWorkFlow} from "@/app/generate/new_doc/WorkflowContext";

export default function PickTemplate({params}: { params: { id: string } }) {
    const supabase = createClientComponentClient<Database>();
    const [isLoading, setIsLoading] = useState(true);
    const [projects, setProjects] = useState([]);
    const [error, setError] = useState('');

    const {template, formData, document, pickTemplate} = useWorkFlow();

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

    function truncateText(text, length) {
        if (text.length <= length) {
            return text;
        }
        return text.substring(0, length) + '...';
    }

    return (
        <div className="p-4">
            <div className="text-3xl font-semibold text-white text-center px-16 mb-6">
                Generate New doc
            </div>
            <div className="mb-4 flex justify-end px-16">
                <Link href="generate/new_doc">
                    <p className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                        Create New Project
                    </p>
                </Link>
            </div>
            {isLoading ? (
                <p className="text-center text-blue-500">Loading...</p>
            ) : error ? (
                <p className="text-center text-red-500">{error}</p>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-white px-16 mt-5">
                    {projects.length > 0 ? (
                        projects.map((project, index) => (
                            <button key={index} onClick={() => pickTemplate(project)}
                                    className="p-4 border rounded shadow-sm hover:shadow-lg transition-shadow duration-200">
                                <h2 className="text-lg font-semibold mb-3">{project.name}</h2>
                                <p className="mb-4">{truncateText(project.content, 400)}</p>
                                {/*<Link href={`/generate/${project.template_id}`}>*/}
                                {/*    <p className="text-blue-500 hover:underline">Select Template</p>*/}
                                {/*</Link>*/}
                            </button>
                        ))
                    ) : (
                        <p className="text-center">No projects found.</p>
                    )}
                </div>
            )}
        </div>
    );
}
