import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Optimizaciones de JavaScript para navegadores modernos
  compiler: {
    // Eliminar console.log en producción
    removeConsole: process.env.NODE_ENV === 'production',
  },
  
  // Configuración de webpack para optimizar JavaScript
  webpack: (config, { dev, isServer }) => {
    // Optimizaciones para producción
    if (!dev && !isServer) {
      // Configurar browserslist para reducir polyfills
      config.resolve.alias = {
        ...config.resolve.alias,
      };
      
      // Deshabilitar polyfills específicos para navegadores modernos
      config.resolve.fallback = {
        ...config.resolve.fallback,
        // No incluir polyfills para estas APIs nativas
        crypto: false,
        stream: false,
        util: false,
        buffer: false,
        process: false,
      };
      
      // Optimizar chunks
      config.optimization.splitChunks = {
        ...config.optimization.splitChunks,
        cacheGroups: {
          ...config.optimization.splitChunks?.cacheGroups,
          // Agrupar vendor libraries
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
            priority: 10,
          },
          // Agrupar componentes comunes
          common: {
            name: 'common',
            minChunks: 2,
            chunks: 'all',
            priority: 5,
            reuseExistingChunk: true,
          },
        },
      };
    }
    
    return config;
  },
  
  // Configuración experimental para optimizaciones
  experimental: {
    // Optimizar imports
    optimizePackageImports: ['lucide-react', '@radix-ui/react-icons'],
  },
  
  // Configuración de SWC para navegadores modernos
  swcMinify: true,
  
  // Configuración de Turbopack
  turbopack: {
    rules: {
      '*.svg': {
        loaders: ['@svgr/webpack'],
        as: '*.js',
      },
    },
  },
  
  // Headers de seguridad y rendimiento
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
