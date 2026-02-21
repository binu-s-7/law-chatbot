import {createServerComponentClient} from '@supabase/auth-helpers-nextjs';
import {cookies} from 'next/headers';
import Link from 'next/link';
import {redirect} from 'next/navigation';

import SignOut from '@/components/SignOut';

export default async function Profile() {
    const supabase = createServerComponentClient({cookies});

    const {
        data: {user},
    } = await supabase.auth.getUser();

    if (!user) {
        redirect('/sign-in');
    } else {
        console.log(user);
    }

    return (
        <div className="bg-gray-800 text-white max-w-4xl mx-auto my-8 p-6 rounded-lg shadow-lg pt-16">
            <h2 className="text-2xl font-bold mb-6">User Profile</h2>
            <div>
                <span className="font-semibold">Email:</span>
                <code className="bg-gray-700 p-1 ml-2 rounded">{user.email}</code>
            </div>
            <div className="mt-4">
                <span className="font-semibold">Last Signed In:</span>
                {/*<code className="bg-gray-700 p-1 rounded block">{new Date(user.last_sign_in_at).toUTCString()}</code>*/}
                <code className="bg-gray-700 p-1 rounded ml-2">{new Date(user.last_sign_in_at).toUTCString()}</code>
            </div>
            <Link href="/"
                  className="inline-block bg-blue-500 mt-4 py-2 px-4 rounded hover:bg-blue-600 transition-colors duration-200 text-center">
                Go Home
            </Link>
            <div className="mt-4">
                <SignOut/>
            </div>
        </div>
    );
}
