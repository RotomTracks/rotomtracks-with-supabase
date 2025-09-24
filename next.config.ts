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
      
      // Excluir módulos de polyfills específicos
      config.resolve.alias = {
        ...config.resolve.alias,
        // Excluir polyfills que ya están disponibles en navegadores modernos
        'core-js/modules/es.array.at': false,
        'core-js/modules/es.array.flat': false,
        'core-js/modules/es.array.flat-map': false,
        'core-js/modules/es.object.from-entries': false,
        'core-js/modules/es.object.has-own': false,
        'core-js/modules/es.string.trim-end': false,
        'core-js/modules/es.string.trim-start': false,
      };
      
      // Configurar webpack para ignorar polyfills específicos
      config.plugins = config.plugins || [];
      config.plugins.push(
        new (require('webpack')).IgnorePlugin({
          resourceRegExp: /^(core-js\/modules\/es\.(array\.(at|flat|flat-map)|object\.(from-entries|has-own)|string\.(trim-end|trim-start)))$/,
        })
      );
      
      // Optimizar chunks para reducir JavaScript no utilizado
      config.optimization.splitChunks = {
        ...config.optimization.splitChunks,
        chunks: 'all',
        minSize: 20000,
        maxSize: 100000, // Limitar tamaño de chunks para evitar tareas largas
        cacheGroups: {
          ...config.optimization.splitChunks?.cacheGroups,
          // Chunk para React y librerías core
          react: {
            test: /[\\/]node_modules[\\/](react|react-dom|scheduler)[\\/]/,
            name: 'react',
            chunks: 'all',
            priority: 20,
            enforce: true,
          },
          // Chunk para Supabase
          supabase: {
            test: /[\\/]node_modules[\\/](@supabase)[\\/]/,
            name: 'supabase',
            chunks: 'all',
            priority: 15,
            enforce: true,
          },
          // Chunk para UI libraries
          ui: {
            test: /[\\/]node_modules[\\/](@radix-ui|lucide-react)[\\/]/,
            name: 'ui',
            chunks: 'all',
            priority: 12,
            enforce: true,
          },
          // Chunk para otras vendor libraries
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
            priority: 10,
            maxSize: 50000, // Chunks más pequeños
          },
          // Chunk para componentes comunes
          common: {
            name: 'common',
            minChunks: 2,
            chunks: 'all',
            priority: 5,
            reuseExistingChunk: true,
            maxSize: 30000,
          },
          // Chunk para páginas específicas
          pages: {
            test: /[\\/]app[\\/]/,
            name: 'pages',
            chunks: 'all',
            priority: 8,
            maxSize: 40000,
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
  
  // Configuración de SWC para navegadores modernos (ya habilitado por defecto)
  
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
          {
            source: '/non-critical.css',
            headers: [
              {
                key: 'Cache-Control',
                value: 'public, max-age=31536000, immutable',
              },
            ],
          },
          {
            source: '/_next/static/css/(.*)',
            headers: [
              {
                key: 'Cache-Control',
                value: 'public, max-age=31536000, immutable',
              },
            ],
          },
        ];
      },
};

export default nextConfig;
