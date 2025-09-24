module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
    // Optimización para producción
    ...(process.env.NODE_ENV === 'production' && {
      cssnano: {
        preset: ['default', {
          discardComments: {
            removeAll: true,
          },
          normalizeWhitespace: true,
          colormin: true,
          minifySelectors: true,
          minifyParams: true,
          minifyGradients: true,
          minifyFontValues: true,
          minifyTimingFunctions: true,
          minifyTransforms: true,
          reduceIdents: true,
          zindex: false, // Mantener z-index para evitar problemas
        }]
      }
    })
  },
}
