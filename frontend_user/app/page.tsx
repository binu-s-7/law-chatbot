import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { redirect } from 'next/navigation';



const cards = [
    // Example card data
    { id: 1, title: 'Chat', imageUrl: '/Tools.png', link: '/chat' },
    { id: 2, title: 'Generate Docs', imageUrl: '/Projects.png', link: '/generate' },
    { id: 3, title: 'Profile', imageUrl: '/Profile.png', link: '/profile' },
];

export default async function Tools() {
    const supabase = createServerComponentClient({ cookies });

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        redirect('/sign-in');
    }

    return (
        <div className="min-h-screen bg-gray-900 text-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Use your logo image for LexiGuide */}
                <img src="/logo.png" alt="LexiGuide Logo" className="mx-auto" style={{ maxWidth: '200px' }}/>

                <p className="text-2xl font-bold text-center text-gray-100 pb-5">⚖️ Redefine Your Legal Journey with AI
                    Insight ⚖️</p>
                <div className="bg-gray-900 text-gray-300  p-8 mt-10">
                    <div className="flex flex-wrap -mx-4 justify-center text-center">
                        {cards.map((card) => (
                            <div key={card.id} className="w-full sm:w-1/2 md:w-1/3 lg:w-1/4 px-4 mb-8">
                                <Link href={card.link}
                                    className="block bg-gray-800 shadow-lg rounded-lg overflow-hidden">
                                    <div className="relative h-48 w-full">
                                        <img src={card.imageUrl} alt={card.title} className="h-full mx-auto my-auto" />
                                    </div>
                                    <div className="p-4">
                                        <h5 className="text-lg font-semibold">{card.title}</h5>
                                    </div>
                                </Link>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
