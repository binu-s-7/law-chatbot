import {createServerComponentClient} from "@supabase/auth-helpers-nextjs";
import {cookies} from "next/headers";
import {Database} from "@/types/supabase";
import NotificationTable from "@/app/dashboard/notifications/NotificationTable";


export default async function ProjectsView({params}: { params: { id: string } }) {
    const supabase = createServerComponentClient<Database>({cookies})

    const {
        data: {user},
    } = await supabase.auth.getUser()


    return (
        <div className="">
            {/*<ShowProjectData params={params}/>*/}
            <div className="container mx-auto">
            <NotificationTable/>
            </div>
        </div>

    )
}
