/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['localhost'],
  },
  experimental: {
    // Quitar serverActions o configurarlo correctamente
    // serverActions: true, // Esto es lo que causa el error
  },
  // swcMinify ya no es necesario especificarlo en Next.js 15
}

export default nextConfig
