/** @type {import('next').NextConfig} */
const nextConfig = {
    // reactStrictMode: true,
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'res.cloudinary.com',
                pathname: '**',
            },
            {
                protocol: 'https',
                hostname: '127.0.0.1',
                pathname: '**',
            },
            {
                protocol: 'https',
                hostname: 'rtpuuqbnebdnlcqeunvw.supabase.co',
                pathname: '**',
            },
        ],
    },
    // async headers() {
    //     return [
    //     {
    //         source: '/(.*)',
    //         headers: securityHeaders,
    //     },
    //     ];
    // },
};

export default nextConfig;
