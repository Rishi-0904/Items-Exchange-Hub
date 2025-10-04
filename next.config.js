/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  env: {
    MONGODB_URI: process.env.MONGODB_URI,
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    OPENWEATHER_API_KEY: process.env.OPENWEATHER_API_KEY,
  },
  images: {
    domains: ['res.cloudinary.com', 'via.placeholder.com'], // Add any image domains you'll be using
  },
  // Add any other Next.js configurations here
}

module.exports = nextConfig
