import {createServerActionClient} from "@supabase/auth-helpers-nextjs";
import {NextRequest} from "next/server";
import {cookies} from "next/headers";

export async function POST(request: Request, response: Response) {
    try {
        // Initialize Supabase client
        const supabase = createServerActionClient({cookies});

        // console.log("request", request);
        const res_1 = await request.formData()
        console.log(res_1)

        const {
            data: {user},
        } = await supabase.auth.getUser();
        console.log("user", user);

        if (user) {
            const {data, error} = await supabase
                .from('chat_session')
                .insert([
                    {
                        chat_name: "Chat",
                    },
                ])
                .select()

            const chat_id = data[0].chat_id;
            console.log("data", chat_id);

            if (chat_id) {
                // send api for LLM

                // save first chat to the database
                const {data, error} = await supabase
                    .from('chat_message')
                    .insert([
                        {
                            chat_id: chat_id,
                            message: "Chat started",
                            user_id: user.id,
                        },
                    ])
                    .select()


            } else {
                return Response.json({error: "There is an error in the request. Please try again."})
            }

            return Response.json({chat_id: chat_id})

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