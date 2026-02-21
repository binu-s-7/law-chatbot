import {createServerComponentClient} from '@supabase/auth-helpers-nextjs';
import {cookies} from 'next/headers';
import {redirect} from 'next/navigation';

import ShowProfiles from "@/app/profile/showProfiles";

export default async function Profile() {
    const supabase = createServerComponentClient({cookies});

    const {
        data: {user},
    } = await supabase.auth.getUser();

    if (!user) {
        redirect('/sign-in');
    } else {
        // console.log(user);
    }

    // if user exits, then get more user details from profile table
    if (user) {
        const {data, error} = await supabase.from('profiles').select().eq('id', user.id).single();
        if (data) {
            user['profile'] = data;
        }
        else {
            console.log("No profile found for user")
        }
    }

    // console.log(user)

    return (
        <div className="bg-gray-900 text-white h-screen flex flex-col justify-center items-center">
            <ShowProfiles user={user}/>
        </div>

    );
}
