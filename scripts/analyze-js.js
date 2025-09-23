#!/usr/bin/env node

/**
 * Script para analizar el JavaScript generado y verificar optimizaciones
 */

const fs = require('fs');
const path = require('path');

function analyzeJavaScript() {
  console.log('📊 Analizando JavaScript...');
  
  try {
    // Buscar archivos JS en .next/static/chunks
    const chunksDir = path.join(__dirname, '../.next/static/chunks');
    
    if (!fs.existsSync(chunksDir)) {
      console.log('⚠️  No se encontró el directorio de chunks. Ejecuta "npm run build" primero.');
      return;
    }
    
    const jsFiles = fs.readdirSync(chunksDir).filter(file => file.endsWith('.js'));
    
    if (jsFiles.length === 0) {
      console.log('⚠️  No se encontraron archivos JavaScript.');
      return;
    }
    
    let totalSize = 0;
    let polyfillMethods = [];
    const polyfillPatterns = [
      'Array.prototype.at',
      'Array.prototype.flat',
      'Array.prototype.flatMap',
      'Object.fromEntries',
      'Object.hasOwn',
      'String.prototype.trimEnd',
      'String.prototype.trimStart',
      'Array.prototype.includes',
      'Object.assign',
      'Promise.prototype.finally',
      'Array.prototype.find',
      'Array.prototype.findIndex'
    ];
    
    console.log('\n📄 Archivos JavaScript encontrados:');
    
    jsFiles.forEach(file => {
      const filePath = path.join(chunksDir, file);
      const content = fs.readFileSync(filePath, 'utf8');
      const size = Buffer.byteLength(content, 'utf8');
      
      totalSize += size;
      
      // Buscar métodos polyfill específicos
      polyfillPatterns.forEach(pattern => {
        if (content.includes(pattern)) {
          polyfillMethods.push({
            file,
            method: pattern,
            size: size
          });
        }
      });
      
      console.log(`   ${file}: ${(size / 1024).toFixed(2)} KB`);
    });
    
    console.log('\n📈 Resumen:');
    console.log(`   Total archivos JS: ${jsFiles.length}`);
    console.log(`   Tamaño total: ${(totalSize / 1024).toFixed(2)} KB`);
    
    if (polyfillMethods.length > 0) {
      console.log(`\n⚠️  Polyfills detectados (${polyfillMethods.length}):`);
      polyfillMethods.forEach(({ file, method }) => {
        console.log(`   ${method} en ${file}`);
      });
      
      console.log('\n💡 Sugerencias de optimización:');
      console.log('   - Verificar configuración de browserslist');
      console.log('   - Actualizar target de TypeScript a ES2020+');
      console.log('   - Configurar Next.js para navegadores modernos');
    } else {
      console.log('\n✅ No se detectaron polyfills innecesarios');
    }
    
    // Verificar configuración de browserslist
    const browserslistPath = path.join(__dirname, '../.browserslistrc');
    if (fs.existsSync(browserslistPath)) {
      console.log('   ✅ Browserslist configurado');
    } else {
      console.log('   ❌ Browserslist no configurado');
    }
    
    // Verificar configuración de TypeScript
    const tsconfigPath = path.join(__dirname, '../tsconfig.json');
    if (fs.existsSync(tsconfigPath)) {
      const tsconfig = JSON.parse(fs.readFileSync(tsconfigPath, 'utf8'));
      const target = tsconfig.compilerOptions?.target;
      if (target && ['ES2020', 'ES2021', 'ES2022', 'ESNext'].includes(target)) {
        console.log(`   ✅ TypeScript target optimizado: ${target}`);
      } else {
        console.log(`   ⚠️  TypeScript target podría ser más moderno: ${target}`);
      }
    }
    
    // Verificar configuración de Next.js
    const nextConfigPath = path.join(__dirname, '../next.config.ts');
    if (fs.existsSync(nextConfigPath)) {
      const nextConfig = fs.readFileSync(nextConfigPath, 'utf8');
      if (nextConfig.includes('removeConsole') && nextConfig.includes('optimizePackageImports')) {
        console.log('   ✅ Next.js configurado para optimizaciones');
      } else {
        console.log('   ⚠️  Next.js podría tener más optimizaciones');
      }
    }
    
  } catch (error) {
    console.error('❌ Error analizando JavaScript:', error.message);
  }
}

if (require.main === module) {
  analyzeJavaScript();
}

module.exports = { analyzeJavaScript };
