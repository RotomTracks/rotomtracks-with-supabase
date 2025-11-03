import React from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './app/App';

console.log('🚀 main.tsx loaded');

// Update loading message
const loadingElement = document.getElementById('loading');
if (loadingElement) {
  loadingElement.textContent = 'React cargado, montando aplicación...';
  loadingElement.style.color = 'green';
}

try {
  const container = document.getElementById('root');
  if (!container) {
    throw new Error('No se encontró el elemento #root');
  }
  
  console.log('📦 Creating React root...');
  const root = createRoot(container);
  
  console.log('🎨 Rendering App...');
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
  
  console.log('✅ App rendered successfully');
  
  // Clear loading message
  if (loadingElement) {
    loadingElement.textContent = 'Aplicación iniciada correctamente ✓';
  }
} catch (error) {
  console.error('❌ Error fatal:', error);
  
  // Show error on screen
  const container = document.getElementById('root');
  if (container) {
    container.innerHTML = `
      <div style="padding: 40px; font-family: monospace; max-width: 800px; margin: 0 auto;">
        <h1 style="color: red;">❌ Error Fatal</h1>
        <pre style="background: #f5f5f5; padding: 20px; border-radius: 8px; overflow: auto;">
${error instanceof Error ? error.stack : String(error)}
        </pre>
      </div>
    `;
  }
  
  if (loadingElement) {
    loadingElement.textContent = `Error: ${error instanceof Error ? error.message : String(error)}`;
    loadingElement.style.color = 'red';
  }
}




