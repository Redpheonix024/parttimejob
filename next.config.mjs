import { execSync } from 'child_process';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Clear Next.js cache on server start
const clearCache = () => {
  try {
    if (process.env.NODE_ENV === 'development') {
      const __filename = fileURLToPath(import.meta.url);
      const __dirname = dirname(__filename);
      const projectRoot = join(__dirname, '..');
      const cacheDir = join(projectRoot, '.next/cache');
      
      console.log('\x1b[36m%s\x1b[0m', 'Clearing Next.js cache...');
      
      // Clear .next/cache directory
      try {
        execSync(`rm -rf "${cacheDir}"`);
        console.log('\x1b[32m%s\x1b[0m', '✓ Next.js cache cleared successfully');
      } catch (error) {
        console.warn('\x1b[33m%s\x1b[0m', '⚠ Could not clear cache directory. It might not exist yet.');
      }
    }
  } catch (error) {
    console.error('\x1b[31m%s\x1b[0m', 'Error clearing cache:', error.message);
  }
};

// Run cache clearing
clearCache();

let userConfig = undefined;
try {
  userConfig = await import("./v0-user-next.config");
} catch (e) {
  // ignore error
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  distDir: ".next",
  poweredByHeader: false,
  generateEtags: true,
  compress: true,
  experimental: {
    webpackBuildWorker: true,
    parallelServerBuildTraces: true,
    parallelServerCompiles: true,
    optimizePackageImports: ['lucide-react', '@radix-ui/react-icons'],
  },
  webpack: (config, { dev, isServer, webpack }) => {
    if (dev && !isServer) {
      // Disable Fast Refresh
      config.plugins = config.plugins.filter(
        plugin => plugin.constructor.name !== 'ReactRefreshWebpackPlugin'
      );
      
      // Disable compression in development to help with HMR
      config.optimization.minimize = false;
      
      // Add better HMR settings
      config.watchOptions = {
        poll: 1000,
        aggregateTimeout: 300,
        ignored: ['**/.git/**', '**/node_modules/**', '**/.next/**']
      };

      // Improve chunk splitting for better HMR
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          default: false,
          vendors: false,
          // Create a vendor chunk for better caching
          vendor: {
            name: 'vendor',
            chunks: 'all',
            test: /node_modules/,
            priority: 20,
          },
          // Create a common chunk for shared code
          common: {
            name: 'common',
            minChunks: 2,
            chunks: 'all',
            priority: 10,
            reuseExistingChunk: true,
            enforce: true,
          },
        },
      };
    }

    // Add better chunk naming for easier debugging
    config.output.chunkFilename = dev 
      ? 'static/chunks/[name].[chunkhash].js'
      : 'static/chunks/[name].[contenthash].js';

    return config;
  },

  async headers() {
    return [
      {
        // Apply these headers to all routes
        source: "/:path*",
        headers: [
          {
            key: "Access-Control-Allow-Origin",
            value: "*", // Be careful with '*' in production
          },
          {
            key: "Access-Control-Allow-Methods",
            value: "GET,OPTIONS,PATCH,DELETE,POST,PUT",
          },
          {
            key: "Access-Control-Allow-Headers",
            value: "X-Requested-With, Content-Type, Authorization",
          },
        ],
      },
    ];
  },
};

mergeConfig(nextConfig, userConfig);

function mergeConfig(nextConfig, userConfig) {
  if (!userConfig) {
    return;
  }

  for (const key in userConfig) {
    if (
      typeof nextConfig[key] === "object" &&
      !Array.isArray(nextConfig[key])
    ) {
      nextConfig[key] = {
        ...nextConfig[key],
        ...userConfig[key],
      };
    } else {
      nextConfig[key] = userConfig[key];
    }
  }
}

export default nextConfig;
