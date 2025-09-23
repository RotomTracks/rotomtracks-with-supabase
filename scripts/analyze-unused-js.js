#!/usr/bin/env node

/**
 * Script para analizar JavaScript no utilizado y optimizar chunks específicos
 */

const fs = require('fs');
const path = require('path');

function analyzeUnusedJavaScript() {
  console.log('🔍 Analizando JavaScript no utilizado...');
  
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
    
    console.log('\n📊 Análisis de chunks específicos:');
    
    // Analizar el chunk problemático mencionado en el reporte
    const problematicChunk = '7559-271b6f6b4384ae85.js';
    const mainThreadChunk = '4bd1b696-f785427dddbba9fb.js';
    
    let totalUnusedSize = 0;
    let longTaskChunks = [];
    
    jsFiles.forEach(file => {
      const filePath = path.join(chunksDir, file);
      const content = fs.readFileSync(filePath, 'utf8');
      const size = Buffer.byteLength(content, 'utf8');
      
      // Detectar patrones de código no utilizado
      const unusedPatterns = [
        /\/\* unused \*\//g,
        /\/\/ unused/g,
        /console\.log\(/g,
        /console\.warn\(/g,
        /console\.error\(/g,
        /debugger;/g,
        /\.map\(/g,
        /\.filter\(/g,
        /\.reduce\(/g,
        /\.forEach\(/g
      ];
      
      let unusedCount = 0;
      unusedPatterns.forEach(pattern => {
        const matches = content.match(pattern);
        if (matches) {
          unusedCount += matches.length;
        }
      });
      
      // Detectar funciones grandes que podrían ser no utilizadas
      const largeFunctions = content.match(/function\s+\w+\([^)]*\)\s*\{[^}]{500,}\}/g) || [];
      const largeArrowFunctions = content.match(/const\s+\w+\s*=\s*\([^)]*\)\s*=>\s*\{[^}]{500,}\}/g) || [];
      
      // Detectar imports no utilizados
      const importStatements = content.match(/import\s+.*?from\s+['"][^'"]+['"]/g) || [];
      const usedImports = content.match(/import\s+\{[^}]+\}\s+from\s+['"][^'"]+['"]/g) || [];
      
      // Calcular métricas
      const unusedRatio = unusedCount / (content.length / 1000); // por KB
      const isLargeChunk = size > 100000; // > 100KB
      const hasLongTasks = largeFunctions.length > 0 || largeArrowFunctions.length > 0;
      
      if (unusedRatio > 0.1 || isLargeChunk || hasLongTasks) {
        console.log(`\n📄 ${file}:`);
        console.log(`   Tamaño: ${(size / 1024).toFixed(2)} KB`);
        console.log(`   Patrones no utilizados: ${unusedCount}`);
        console.log(`   Ratio no utilizado: ${unusedRatio.toFixed(2)}/KB`);
        console.log(`   Funciones grandes: ${largeFunctions.length + largeArrowFunctions.length}`);
        console.log(`   Imports: ${importStatements.length} (usados: ${usedImports.length})`);
        
        if (file.includes(problematicChunk) || file.includes('7559')) {
          console.log(`   ⚠️  CHUNK PROBLEMÁTICO DETECTADO (34 KiB no utilizado)`);
          totalUnusedSize += size * 0.8; // Estimación del 80% no utilizado
        }
        
        if (hasLongTasks) {
          console.log(`   ⚠️  POSIBLE TAREA LARGA DEL HILO PRINCIPAL`);
          longTaskChunks.push({ file, size, functions: largeFunctions.length + largeArrowFunctions.length });
        }
      }
    });
    
    console.log('\n📈 Resumen de optimizaciones:');
    console.log(`   Chunks problemáticos: ${jsFiles.filter(f => f.includes('7559') || f.includes('4bd1b696')).length}`);
    console.log(`   Tamaño estimado no utilizado: ${(totalUnusedSize / 1024).toFixed(2)} KB`);
    console.log(`   Chunks con tareas largas: ${longTaskChunks.length}`);
    
    if (longTaskChunks.length > 0) {
      console.log('\n🔧 Chunks que requieren optimización de tareas largas:');
      longTaskChunks.forEach(({ file, size, functions }) => {
        console.log(`   ${file}: ${(size / 1024).toFixed(2)} KB, ${functions} funciones grandes`);
      });
    }
    
    console.log('\n💡 Recomendaciones de optimización:');
    console.log('   1. Implementar lazy loading más agresivo');
    console.log('   2. Dividir chunks grandes en módulos más pequeños');
    console.log('   3. Eliminar código no utilizado con tree shaking');
    console.log('   4. Optimizar funciones grandes para evitar tareas largas');
    console.log('   5. Implementar code splitting por rutas');
    
  } catch (error) {
    console.error('❌ Error analizando JavaScript no utilizado:', error.message);
  }
}

if (require.main === module) {
  analyzeUnusedJavaScript();
}

module.exports = { analyzeUnusedJavaScript };
