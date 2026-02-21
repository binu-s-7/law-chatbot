import {createServerActionClient} from "@supabase/auth-helpers-nextjs";
import {NextRequest} from "next/server";
import {cookies} from "next/headers";

export async function POST(request: Request, response: Response) {
    try {
        // Initialize Supabase client
        const supabase = createServerActionClient({cookies});

        // console.log("request", request);
        const res_1 = await request.formData()
        console.log(res_1)  // {"prompt":"Batman"}

        // get title, description, file, pageId from request
        const title = res_1.get("title")
        const description = res_1.get("description")
        const file = res_1.get("file")
        const pageId = res_1.get("pageId")

        const {
            data: {user},
        } = await supabase.auth.getUser();

        if (user) {
            if (file?.name === undefined) {
                return response.status(400).json({error: 'File not uploaded'});
            } else {
                // console.log("user", user);
                // console.log("title", title);

                // get project id from url
                const random = Math.random().toString(36).substring(7);
                const filename = pageId + "/" + random + "_" + file?.name;
                // console.log("file", file);
                //
                console.log("filename", filename);
                const a = await supabase.storage.from('files').upload(filename, file, {
                    cacheControl: '3600',
                    upsert: false,
                });
                console.log("a", a);

                if (a.error) {
                    return response.status(500).json({error: 'File not uploaded'});
                } else {
                    // project_id, user_id, file_name, description, link, created_at, updated_at
                    const b = await supabase.from("files").insert({
                        project_id: Number(pageId),
                        user_id: user.id,
                        file_name: filename,
                        title: title,
                        description: description,
                        link: null,
                        type: file.type,
                        extension: file.name.split('.').pop(),
                    }).select();
                    console.log("b", b);

                    // const {data} = supabase.storage.from('files').getPublicUrl(filename);
                    const {data, error} = await supabase
                        .storage
                        .from('files')
                        .createSignedUrl(filename, 36000)
                    console.log("data", data);
                    console.log("data", data);
                    console.log("data", data.signedUrl);
                    console.log("data", data.signedUrl);
                    // return Response.json({filename: filename, url: data.publicUrl})
                    return Response.json({filename: filename, url: data.signedUrl})

                    // const {data: downloadData, error: downloadError} = await supabase
                    //     .storage
                    //     .from('files')
                    //     .download(filename);

                    // https://pdoiviazesoprohexapl.supabase.co/storage/v1/object/sign/files/18/ca7y9b_download%20(1).png
                    // https://pdoiviazesoprohexapl.supabase.co/storage/v1/object/public/files/18/exga99_download%20(1).png
                    // https://pdoiviazesoprohexapl.supabase.co/storage/v1/object/public/files/18/cmijzf_download%20(1).png
                    // https://pdoiviazesoprohexapl.supabase.co/storage/v1/object/public/files/18/b8nzgj_images.jpg
                    // https://pdoiviazesoprohexapl.supabase.co/storage/v1/object/public/files/18/b8nzgj_images.jpg
                    // https://pdoiviazesoprohexapl.supabase.co/storage/v1/object/public/files/18/b8nzgj_images.jpg


                    // const returnFileName = response.data[0].file_name;
                    // console.log("b", returnFileName);
                    // console.log("b", returnFileName);
                    // console.log("b", returnFileName);
                    // // console.log("Done");
                    // if (filename === returnFileName) {
                    //     const {data} = supabase.storage.from('files').getPublicUrl(filename);
                    //     console.log("data", data.publicUrl);
                    //     console.log("data", data.publicUrl);
                    //     console.log("data", data.publicUrl);
                    //     console.log("data", data.publicUrl);
                    //     return Response.json({filename: returnFileName, url: data.publicUrl})
                    // } else {
                    //     const {data} = supabase.storage.from('files').getPublicUrl(returnFileName);
                    //     console.log("data", data.publicUrl);
                    //     console.log("data", data.publicUrl);
                    //     console.log("data", data.publicUrl);
                    //     console.log("data", data.publicUrl);
                    //     return Response.json({filename: returnFileName, url: data.publicUrl})
                    // }
                }
            }
        }

        return Response.json({error: "There is an error in the request. Please try again."})

    } catch (error) {
        return Response.json({error: error.message})
    }
}


export async function GET(request: NextRequest, response: NextRequest) {
    try {
        console.log("sending data")
        return Response.json({message: "Hello, world!"})
    } catch (error) {
        return Response.json({error: error.message})
    }
}