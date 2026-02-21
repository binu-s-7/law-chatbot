import {createServerComponentClient} from "@supabase/auth-helpers-nextjs";
import {cookies} from "next/headers";
import {Database} from "@/types/supabase";

export default async function ProjectsView({params}: { params: { id: string } }) {
    const supabase = createServerComponentClient<Database>({cookies})

    const {
        data: {user},
    } = await supabase.auth.getUser()


    return (
        <div className="flex justify-center items-center h-screen bg-gray-900 text-white text-4xl">
            <div className="text-center">
                Click on New Chat to Get Started
            </div>
        </div>
    );
}
