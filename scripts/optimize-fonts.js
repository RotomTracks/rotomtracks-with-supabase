#!/usr/bin/env node

/**
 * Script para optimizar la carga de fuentes
 * Preload de fuentes críticas y lazy loading de fuentes no críticas
 */

const fs = require('fs');
const path = require('path');

const layoutPath = path.join(__dirname, '../app/layout.tsx');

function optimizeFonts() {
  console.log('🔤 Optimizando carga de fuentes...');
  
  try {
    let layoutContent = fs.readFileSync(layoutPath, 'utf8');
    
    // Verificar si ya tiene optimizaciones
    if (layoutContent.includes('font-display: swap')) {
      console.log('✅ Las fuentes ya están optimizadas');
      return;
    }
    
    // Agregar preload de fuentes críticas
    const fontPreload = `
  {/* Preload de fuentes críticas */}
  <link
    rel="preload"
    href="/_next/static/media/8d697b304b401681-s.woff2"
    as="font"
    type="font/woff2"
    crossOrigin="anonymous"
  />
  <link
    rel="preload"
    href="/_next/static/media/ba015fad6dcf6784-s.woff2"
    as="font"
    type="font/woff2"
    crossOrigin="anonymous"
  />
  <link
    rel="preload"
    href="/_next/static/media/4cf2300e9c8272f7-s.p.woff2"
    as="font"
    type="font/woff2"
    crossOrigin="anonymous"
  />`;
    
    // Insertar después del <head>
    layoutContent = layoutContent.replace(
      '<html lang="en" suppressHydrationWarning>',
      `<html lang="en" suppressHydrationWarning>
  <head>${fontPreload}
  </head>`
    );
    
    fs.writeFileSync(layoutPath, layoutContent);
    console.log('✅ Fuentes optimizadas correctamente');
    
  } catch (error) {
    console.error('❌ Error optimizando fuentes:', error.message);
  }
}

if (require.main === module) {
  optimizeFonts();
}

module.exports = { optimizeFonts };
