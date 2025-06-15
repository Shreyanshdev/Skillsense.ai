// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "i.pravatar.cc",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "images.pexels.com",
        port: "",
        pathname: "/**",
      },
    ],
  },
  webpack: (
    config: { resolve?: { alias?: Record<string, string>; fallback?: Record<string, unknown> } },
    { isServer }: { isServer: boolean }
  ) => {
    // Monaco Editor configuration (only needed on client-side)
    if (!isServer) {
      config.resolve = config.resolve || {};
      config.resolve.alias = {
        ...config.resolve.alias,
        'monaco-editor': 'monaco-editor/esm/vs/editor/editor.api.js'
      };
    }

    // Required fallbacks
    config.resolve = config.resolve || {};
    config.resolve.fallback = {
      ...config.resolve.fallback,
      bufferutil: false,
      "utf-8-validate": false,
      buffer: require.resolve("buffer/"),
    };

    return config;
  },
};

module.exports = nextConfig;