/** @type {import('next').NextConfig} */
// https://js.langchain.com/docs/getting-started/install#vercel--nextjs
// To use LangChain with Next.js (either with app/ or pages/), add the following to your next.config.js to enable support for WebAssembly modules (which is required by the tokenizer library @dqbd/tiktoken):
const nextConfig = {
  webpack(config) {
    config.experiments = {
      asyncWebAssembly: true,
      layers: true,
    };

    return config;
  },
  // Add env { API_KEY: process.env.API_KEY}
  env: {
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    SERPAPI_API_KEY: process.env.SERPAPI_API_KEY,
    PINCONE_API_KEY: process.env.PINCONE_API_KEY,
    PINCONE_ENV: process.env.PINCONE_ENV,
    PINCODE_INDEX: process.env.PINCODE_INDEX,
  },
};

module.exports = nextConfig;
