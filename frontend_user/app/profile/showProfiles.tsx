'use client';

import SignOut from '@/components/SignOut';
import Link from "next/link";

export default async function ShowProfiles({user}) {

    return (
        <div className="max-w-4xl w-full mx-auto p-8 rounded-lg">
            <h2 className="text-3xl font-bold mb-8 text-center">User Profile</h2>

            {user.profile && ( // if user profile exists
                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <span className="font-semibold text-xl">Username:</span>
                        <span className="text-lg">{user.profile.username}</span>
                    </div>

                    <div className="flex justify-between items-center">
                        <span className="font-semibold text-xl">Email:</span>
                        <span className="text-lg">{user.email}</span>
                    </div>

                    <div className="flex justify-between items-center">
                        <span className="font-semibold text-xl">First Name:</span>
                        <span className="text-lg">{user.profile.first_name}</span>
                    </div>

                    <div className="flex justify-between items-center">
                        <span className="font-semibold text-xl">Second Name:</span>
                        <span className="text-lg">{user.profile.second_name}</span>
                    </div>

                    <div className="flex justify-between items-center">
                        <span className="font-semibold text-xl">Last Signed In:</span>
                        <span className="text-lg">{new Date(user.last_sign_in_at).toUTCString()}</span>
                    </div>
                </div>
            )}


            <div className="text-center space-y-4 mt-6">
                <Link href="/"
                      className="inline-block bg-blue-500 py-2 px-4 rounded hover:bg-blue-600 transition-colors duration-200 text-lg">
                    Go Home
                </Link>
                <div>
                    <SignOut/>
                </div>
            </div>
        </div>
    );
}
