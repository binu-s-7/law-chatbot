import {createServerComponentClient} from "@supabase/auth-helpers-nextjs";
import {cookies} from "next/headers";
import {Database} from "@/types/supabase";
import ChatWindow from "@/app/chat/[chat_id]/chatWindow";

export default async function ChatWindowView({params}: { params: { id: string } }) {
    const supabase = createServerComponentClient<Database>({cookies})

    const {
        data: {user},
    } = await supabase.auth.getUser()

    return (
        <div>
            <ChatWindow params={params}/>
        </div>
    )
}
