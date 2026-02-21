'use client';

import {createClientComponentClient} from "@supabase/auth-helpers-nextjs";
import {Database} from "@/types/supabase";
import AddFilesIcon from "@/app/dashboard/files/addFilesIcon";
import {useState} from "react";

// import {useRef} from "react";

interface NewFilesProps {
    mode?: "icon" | "full";
}


async function fetchFileInfo(file_id: number, user_id: string, by_admin: boolean, data_type: string) {
    const bodyData = {
        file_id,
        user_id,
        by_admin,
        data_type
    };

    console.log("Body Data", bodyData);

    const response = await fetch('http://127.0.0.1:9000/file_to_context', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(bodyData),
    });

    const data = await response.json();
    console.log('response', data);
    return data;

    // return "This is answer"
}

export default function NewFiles({mode = "full"}: NewFilesProps) {
    const [state, setState] = useState("idle");

    const addFiles = async (formData: FormData) => {
        setState("loading")
        const title = String(formData.get("title")) as string | null;
        const description = String(formData.get("description")) as string | null;
        const file = formData.get("projectFile") as File | null;
        const supabase = createClientComponentClient<Database>();

        const {
            data: {user},
        } = await supabase.auth.getUser();

        if (user) {
            if (file?.name === undefined) {
                setState("upload failed")
                throw new Error("File not uploaded");
            } else {

                // get project id from url
                const random = Math.random().toString(36).substring(7);
                const filename = random + "_" + file?.name;
                // console.log("file", file);
                //
                setState("uploading")
                console.log("filename", filename);
                const a = await supabase.storage.from('files').upload(filename, file, {
                    cacheControl: '3600',
                    upsert: false,
                });
                console.log("a", a);

                if (a.error) {
                    setState("upload failed")
                    throw new Error("File not uploaded");
                } else {
                    setState("upload success")
                    // project_id, user_id, file_name, description, link, created_at, updated_at
                    const b = await supabase.from("files").insert({
                        user_id: user.id,
                        file_name: filename,
                        title: title,
                        description: description,
                        link: null,
                        type: file.type,
                        extension: file.name.split('.').pop(),
                    }).select();
                    console.log("b", b);

                    const fileId = b.data[0].file_id;
                    console.log("fileId", fileId);

                    // call backend for data extraction and saving
                    const answer = fetchFileInfo(fileId, user.id, false, "user files");
                }
            }
        }
        setState("idle")

    };


    if (mode === "full") {
        return (
            <div>
                <form action={addFiles}
                      className="flex flex-col items-center justify-center p-5 rounded-lg bg-gray-100 shadow-md mx-10 mt-3">
                    <input type="file" name="projectFile"
                           className="w-full p-2 rounded-md border border-gray-300 mb-2"/>
                    <button type="submit" className="bg-blue-500 text-white p-2 rounded-md">
                        Add File
                    </button>
                </form>
            </div>
        );
    } else {
        return (
            <div>
                <AddFilesIcon onUploadSuccess={addFiles}/>
            </div>
        )
    }
}