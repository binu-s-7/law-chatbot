import {createServerComponentClient} from '@supabase/auth-helpers-nextjs';
import {cookies} from 'next/headers';
import Link from 'next/link';
import {redirect} from 'next/navigation';


export default async function Tools() {
    const supabase = createServerComponentClient({cookies});

    const {
        data: {user},
    } = await supabase.auth.getUser();

    if (!user) {
        redirect('/sign-in');
    }
    else{
        redirect('/dashboard/users');
    }

    return (
        <div className="min-h-screen bg-gray-900 text-gray-300 p-8">

        </div>
    );
}
