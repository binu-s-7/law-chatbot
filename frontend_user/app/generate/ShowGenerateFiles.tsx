'use client';

import {createClientComponentClient} from "@supabase/auth-helpers-nextjs";
import {Database} from "@/types/supabase";
import Link from "next/link";
import React, {useContext, useEffect, useState} from "react";
import {AuthContext} from "@/components/AuthProvider";

export default function ShowGenerateFiles({params}: { params: { id: string } }) {
    const supabase = createClientComponentClient<Database>();
    const [isLoading, setIsLoading] = useState(true);
    const [projects, setProjects] = useState([]);
    const [error, setError] = useState('');

    const {accessToken, user} = useContext(AuthContext);

    useEffect(() => {
        const fetchData = async () => {
            if (!user) return;

            const {data, error} = await supabase
                .from('generated_docs')
                .select()
                .eq('user_id', user.id);

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
            <p className="text-3xl text-center text-white font-semibold py-6">Generate Documents</p>
            <div className="mb-4 flex justify-end">
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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-white px-16">
                    {projects.length > 0 ? (
                        projects.map((project, index) => (
                            <div key={index}
                                 className="p-4 border rounded shadow-sm hover:shadow-lg transition-shadow duration-200">
                                <h2 className="text-lg font-semibold">{project.name}</h2>
                                <p>{truncateText(project.content, 100)}</p>
                                <Link href={`/generate/${project.doc_id}`}>
                                    <p className="text-blue-500 hover:underline">View Details</p>
                                </Link>
                            </div>
                        ))
                    ) : (
                        <p className="text-center">No projects found.</p>
                    )}
                </div>
            )}
        </div>
    );
}
