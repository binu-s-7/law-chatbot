'use client';

import {createClientComponentClient} from '@supabase/auth-helpers-nextjs';
import {useRouter} from "next/navigation";

export default function SignOut() {
    const supabase = createClientComponentClient();

    const router = useRouter();

    async function handleSignOut() {
        console.log('signing out');
        const {error} = await supabase.auth.signOut();
        router.push('/sign-in');
        if (error) {
            // eslint-disable-next-line no-console
            console.error('ERROR:', error);
        }
    }

    return (
        <button type="button" className="button-inverse" onClick={handleSignOut}>
            Sign Out
        </button>
    );
}
