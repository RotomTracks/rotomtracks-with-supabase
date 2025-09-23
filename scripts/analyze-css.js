#!/usr/bin/env node

/**
 * Script para analizar el CSS generado y sugerir optimizaciones
 */

const fs = require('fs');
const path = require('path');

function analyzeCSS() {
  console.log('📊 Analizando CSS...');
  
  try {
    // Buscar archivos CSS en .next/static/css
    const cssDir = path.join(__dirname, '../.next/static/css');
    
    if (!fs.existsSync(cssDir)) {
      console.log('⚠️  No se encontró el directorio CSS. Ejecuta "npm run build" primero.');
      return;
    }
    
    const cssFiles = fs.readdirSync(cssDir).filter(file => file.endsWith('.css'));
    
    if (cssFiles.length === 0) {
      console.log('⚠️  No se encontraron archivos CSS.');
      return;
    }
    
    let totalSize = 0;
    let totalClasses = 0;
    const unusedClasses = [];
    
    cssFiles.forEach(file => {
      const filePath = path.join(cssDir, file);
      const content = fs.readFileSync(filePath, 'utf8');
      const size = Buffer.byteLength(content, 'utf8');
      
      totalSize += size;
      
      // Contar clases CSS
      const classMatches = content.match(/\.[a-zA-Z0-9_-]+/g);
      if (classMatches) {
        totalClasses += classMatches.length;
      }
      
      console.log(`📄 ${file}: ${(size / 1024).toFixed(2)} KB`);
    });
    
    console.log('\n📈 Resumen:');
    console.log(`   Total archivos CSS: ${cssFiles.length}`);
    console.log(`   Tamaño total: ${(totalSize / 1024).toFixed(2)} KB`);
    console.log(`   Clases CSS totales: ${totalClasses.toLocaleString()}`);
    
    // Sugerencias de optimización
    console.log('\n💡 Sugerencias de optimización:');
    
    if (totalSize > 100 * 1024) { // > 100KB
      console.log('   ⚠️  CSS muy grande (>100KB). Considera:');
      console.log('      - Implementar CSS crítico inline');
      console.log('      - Lazy loading de CSS no crítico');
      console.log('      - Purging más agresivo de Tailwind');
    }
    
    if (totalClasses > 10000) {
      console.log('   ⚠️  Muchas clases CSS (>10k). Considera:');
      console.log('      - Revisar clases no utilizadas');
      console.log('      - Optimizar configuración de Tailwind');
    }
    
    if (cssFiles.length > 3) {
      console.log('   ⚠️  Múltiples archivos CSS. Considera:');
      console.log('      - Consolidar archivos CSS');
      console.log('      - Implementar code splitting inteligente');
    }
    
    // Verificar si hay CSS crítico implementado
    const criticalCSSPath = path.join(__dirname, '../app/critical.css');
    if (fs.existsSync(criticalCSSPath)) {
      const criticalSize = Buffer.byteLength(fs.readFileSync(criticalCSSPath, 'utf8'), 'utf8');
      console.log(`   ✅ CSS crítico implementado: ${(criticalSize / 1024).toFixed(2)} KB`);
    } else {
      console.log('   ❌ CSS crítico no implementado. Considera crearlo.');
    }
    
    // Verificar configuración de Tailwind
    const tailwindConfigPath = path.join(__dirname, '../tailwind.config.ts');
    if (fs.existsSync(tailwindConfigPath)) {
      const config = fs.readFileSync(tailwindConfigPath, 'utf8');
      if (config.includes('safelist')) {
        console.log('   ✅ Safelist configurado en Tailwind');
      } else {
        console.log('   ⚠️  Considera configurar safelist en Tailwind');
      }
    }
    
  } catch (error) {
    console.error('❌ Error analizando CSS:', error.message);
  }
}

if (require.main === module) {
  analyzeCSS();
}

module.exports = { analyzeCSS };
