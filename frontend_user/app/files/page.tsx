import {createServerComponentClient} from "@supabase/auth-helpers-nextjs";
import {cookies} from "next/headers";
import {Database} from "@/types/supabase";
import NewFiles from "@/app/files/addFiles";
import ShowFiles from "@/app/files/showFiles";

export default async function FilesView({params}: { params: { id: string } }) {
    // const supabase = createServerComponentClient({cookies});
    const supabase = createServerComponentClient<Database>({cookies})

    const {
        data: {user},
    } = await supabase.auth.getUser()

    return (
        <div>
            <NewFiles/>
            <ShowFiles params={params}/>
        </div>
    )
}
