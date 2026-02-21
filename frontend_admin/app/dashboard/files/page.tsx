import {createServerComponentClient} from "@supabase/auth-helpers-nextjs";
import {cookies} from "next/headers";
import {Database} from "@/types/supabase";
import FilesTable from "@/app/dashboard/files/FilesTable";
import ShowFiles from "@/app/dashboard/files/showFiles";
import NewFiles from "@/app/dashboard/files/addFiles";


export default async function ProjectsView({params}: { params: { id: string } }) {
    const supabase = createServerComponentClient<Database>({cookies})

    const {
        data: {user},
    } = await supabase.auth.getUser()


    return (
        <div className="">
            {/*<ShowProjectData params={params}/>*/}
            <div className="container mx-auto">
                <NewFiles/>
                <FilesTable/>
                <ShowFiles/>
            </div>
        </div>

    )
}
