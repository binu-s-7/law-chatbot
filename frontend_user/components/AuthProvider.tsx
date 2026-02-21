'use client';

import {createContext, useEffect, useState} from 'react';
import {createClientComponentClient} from '@supabase/auth-helpers-nextjs';
import {useRouter} from 'next/navigation';

export const AuthContext = createContext();

const AuthProvider = ({accessToken, user, children}) => {
    const [currentAccessToken, setCurrentAccessToken] = useState(accessToken);
    const supabase = createClientComponentClient();
    const router = useRouter();

    useEffect(() => {
        const {data: {subscription: authListener}} = supabase.auth.onAuthStateChange((event, session) => {
            const newAccessToken = session?.access_token;
            if (newAccessToken !== currentAccessToken) {
                setCurrentAccessToken(newAccessToken);
                router.refresh();
            }
        });

        return () => {
            authListener?.unsubscribe();
        };
    }, [accessToken, supabase, router]);

    return (
        <AuthContext.Provider value={{accessToken: currentAccessToken, user: user, supabase: supabase}}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthProvider;
