import {Message} from "ai";
import {generateText, ollama} from "modelfusion";

export async function POST(req: Request) {
    const {messages}: { messages: Message[] } = await req.json();
    console.log("messages", messages);

    const model = messages[0].model

    const text = await generateText({
        model: ollama
            .ChatTextGenerator({
                model: model,
                maxGenerationTokens: 1500,
            })
            .withTextPrompt(),

        prompt: "User: " + messages[0].content + "\nAI:",

    });

    console.log("text", text);

    //create json response
    const response = {
        response: text,
    }

    return new Response(JSON.stringify(response), {
        headers: {
            "Content-Type": "application/json",
        },
    });

}


// import {createServerActionClient} from "@supabase/auth-helpers-nextjs";
// import {NextRequest} from "next/server";
// import {cookies} from "next/headers";
//
// export async function POST(request: Request, response: Response) {
//     try {
//         // Initialize Supabase client
//         const supabase = createServerActionClient({cookies});
//
//         // console.log("request", request);
//         const res_1 = await request.formData()
//         console.log(res_1)  // {"prompt":"Batman"}
//
//         // get title, description, file, pageId from request
//         // const title = res_1.get("title")
//         // const description = res_1.get("description")
//         // const file = res_1.get("file")
//         // const pageId = res_1.get("pageId")
//
//         const {
//             data: {user},
//         } = await supabase.auth.getUser();
//
//         if (user) {
//             const {data, error} = await supabase
//                 .from('chat_session')
//                 .insert([
//                     {},
//                 ])
//                 .select()
//
//             const chat_id = data[0].chat_id;
//             console.log("data", chat_id);
//
//             if (chat_id) {
//                 // send api for LLM
//
//                 // save first chat to the database
//                 const {data, error} = await supabase
//                     .from('chat_message')
//                     .insert([
//                         {
//                             chat_id: chat_id,
//                             message: "Chat started",
//                             user_id: user.id,
//                         },
//                     ])
//                     .select()
//             }
//             else {
//                 return Response.json({error: "There is an error in the request. Please try again."})
//             }
//             return Response.json({chat_id: chat_id})
//
//         }
//
//         return Response.json({error: "There is an error in the request. Please try again."})
//
//     } catch (error) {
//         return Response.json({error: error.message})
//     }
// }
//
//
// export async function GET(request: NextRequest, response: NextRequest) {
//     try {
//         // const supabase = createServerActionClient({cookies});
//         //
//         // const subscription = supabase
//         //     .channel('chat_session')
//         //     .on(
//         //         'postgres_changes',
//         //         {
//         //             event: 'INSERT',
//         //             schema: 'public',
//         //             table: 'chat_message',
//         //         },
//         //         (payload) => {
//         //             console.log(payload)
//         //             return Response.json({message: payload})
//         //         }
//         //     )
//         //     .subscribe();
//         console.log("sending data")
//         return Response.json({message: "Hello, world!"})
//     } catch (error) {
//         return Response.json({error: error.message})
//     }
// }