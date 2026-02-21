'use client';

import {useEffect, useState} from "react";

export default async function ShowProjects() {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Function to insert data and fetch projects
    const insertAndFetchProjects = async () => {
        setLoading(true);
        setError(null);

        // Step 1: Insert data into 'projects'
        const {data: insertData, error: insertError} = await supabase
            .from('projects')
            .insert([
                {some_column: 'someValue', other_column: 'otherValue'},
            ]);

        if (insertError) {
            setError(insertError.message);
            setLoading(false);
            return;
        }

        // Optionally, perform some actions with insertData if needed

        // Step 2: Fetch projects after insertion
        const {data: fetchData, error: fetchError} = await supabase
            .from('projects')
            .select();

        if (fetchError) {
            setError(fetchError.message);
        } else {
            setProjects(fetchData);
        }
        setLoading(false);
    };

    // Use useEffect to run the insert-fetch operation when the component mounts
    // or based on specific dependencies (e.g., re-fetching when a dependency changes)
    useEffect(() => {
        insertAndFetchProjects();
    }, []); // Empty dependency array means this runs once on mount

    if (loading) return <p>Loading...</p>;
    if (error) return <p>Error: {error}</p>;

    return (
        <div>
            <h1>Projects</h1>
            {projects.map((project, index) => (
                <div key={index}>
                    <p>{project.some_column}: {project.other_column}</p>
                </div>
            ))}
        </div>
    );
    //
    // return (
    //     <div className="bg-gray-800 text-white max-w-4xl mx-auto my-8 p-6 rounded-lg shadow-lg pt-16">
    //         <h2 className="text-2xl font-bold mb-6">User Profile</h2>
    //         <div>
    //             <span className="font-semibold">Email:</span>
    //             <code className="bg-gray-700 p-1 ml-2 rounded">{user.email}</code>
    //         </div>
    //         <div className="mt-4">
    //             <span className="font-semibold">Last Signed In:</span>
    //             {/*<code className="bg-gray-700 p-1 rounded block">{new Date(user.last_sign_in_at).toUTCString()}</code>*/}
    //             <code className="bg-gray-700 p-1 rounded ml-2">{new Date(user.last_sign_in_at).toUTCString()}</code>
    //         </div>
    //         <Link href="/" className="inline-block bg-blue-500 mt-4 py-2 px-4 rounded hover:bg-blue-600 transition-colors duration-200 text-center">
    //             Go Home
    //         </Link>
    //     </div>
    // );
}
