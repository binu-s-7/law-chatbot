import {createServerComponentClient} from "@supabase/auth-helpers-nextjs";
import {cookies} from "next/headers";
import {Database} from "@/types/supabase";
import {WorkflowProvider} from "@/app/generate/new_doc/WorkflowContext";
import Workflow from "@/app/generate/new_doc/WorkFlow";


const cards = [
    // Example card data
    {id: 1, title: 'Summarize', imageUrl: '/Summarize.png', link: '/tools/summarize'},
    {id: 2, title: 'Categorize', imageUrl: '/Categorize.png', link: '/tools/categorize'},
    {id: 3, title: 'Extract Data', imageUrl: '/Extract.png', link: '/tools/extractdata'},
    {id: 3, title: 'Generate Docs', imageUrl: '/Generate 02.png', link: '/tools/generatedocs'},
];

export default async function ProjectsView({params}: { params: { id: string } }) {
    const supabase = createServerComponentClient<Database>({cookies})

    const {
        data: {user},
    } = await supabase.auth.getUser()


    return (
        <div className="">
            <WorkflowProvider>
                {/*<PickTemplate params={params}/>*/}
                <Workflow/>
            </WorkflowProvider>
        </div>

    )
}
