#!/usr/bin/env node

/**
 * Pre-deployment verification script for RotomTracks
 * Checks that all required configurations are in place
 */

const fs = require('fs');
const path = require('path');

console.log('🚀 RotomTracks Pre-Deployment Check\n');

let hasErrors = false;

// Check if required files exist
const requiredFiles = [
  'package.json',
  'next.config.ts',
  '.env.example',
  'vercel.json'
];

console.log('📁 Checking required files...');
requiredFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`✅ ${file}`);
  } else {
    console.log(`❌ ${file} - Missing!`);
    hasErrors = true;
  }
});

// Check environment variables
console.log('\n🔐 Checking environment variables...');
const requiredEnvVars = [
  'NEXT_PUBLIC_API_URL',
  'NEXT_PUBLIC_API_TOKEN',
  'API_SECRET'
];

const legacyEnvVars = [
  'NEXT_PUBLIC_DATABASE_URL',
  'NEXT_PUBLIC_DATABASE_ANON_KEY',
  'DATABASE_SERVICE_KEY'
];

const oldLegacyEnvVars = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY'
];

// Check .env.local if it exists
if (fs.existsSync('.env.local')) {
  const envContent = fs.readFileSync('.env.local', 'utf8');
  
  // Check for new, legacy, or old legacy environment variables
  requiredEnvVars.forEach((envVar, index) => {
    const legacyVar = legacyEnvVars[index];
    const oldLegacyVar = oldLegacyEnvVars[index];
    const hasNew = envContent.includes(envVar);
    const hasLegacy = envContent.includes(legacyVar);
    const hasOldLegacy = envContent.includes(oldLegacyVar);
    
    if (hasNew || hasLegacy || hasOldLegacy) {
      const varName = hasNew ? envVar : (hasLegacy ? legacyVar : oldLegacyVar);
      console.log(`✅ ${varName}`);
    } else {
      console.log(`❌ ${envVar} (or ${legacyVar} or ${oldLegacyVar}) - Missing in .env.local!`);
      hasErrors = true;
    }
  });
} else {
  console.log('⚠️  .env.local not found - make sure to configure environment variables in your deployment platform');
}

// Check package.json scripts
console.log('\n📦 Checking package.json scripts...');
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const requiredScripts = ['dev', 'build', 'start', 'lint'];

requiredScripts.forEach(script => {
  if (packageJson.scripts && packageJson.scripts[script]) {
    console.log(`✅ ${script} script`);
  } else {
    console.log(`❌ ${script} script - Missing!`);
    hasErrors = true;
  }
});

// Check critical dependencies
console.log('\n📚 Checking critical dependencies...');
const criticalDeps = [
  '@supabase/supabase-js',
  '@supabase/ssr',
  'next',
  'react',
  'typescript'
];

criticalDeps.forEach(dep => {
  const inDeps = packageJson.dependencies && packageJson.dependencies[dep];
  const inDevDeps = packageJson.devDependencies && packageJson.devDependencies[dep];
  
  if (inDeps || inDevDeps) {
    console.log(`✅ ${dep}`);
  } else {
    console.log(`❌ ${dep} - Missing!`);
    hasErrors = true;
  }
});

// Check build
console.log('\n🔨 Testing build...');
const { execSync } = require('child_process');

try {
  console.log('Running npm run build...');
  execSync('npm run build', { stdio: 'pipe' });
  console.log('✅ Build successful');
} catch (error) {
  console.log('❌ Build failed!');
  console.log('Error:', error.message);
  hasErrors = true;
}

// Check TypeScript
console.log('\n📝 Checking TypeScript...');
try {
  execSync('npx tsc --noEmit', { stdio: 'pipe' });
  console.log('✅ TypeScript check passed');
} catch (error) {
  console.log('❌ TypeScript errors found!');
  hasErrors = true;
}

// Final result
console.log('\n' + '='.repeat(50));
if (hasErrors) {
  console.log('❌ Pre-deployment check FAILED');
  console.log('Please fix the issues above before deploying.');
  process.exit(1);
} else {
  console.log('✅ Pre-deployment check PASSED');
  console.log('Your application is ready for deployment! 🚀');
  console.log('\nNext steps:');
  console.log('1. Push your code to GitHub');
  console.log('2. Connect your repository to Vercel');
  console.log('3. Configure environment variables in Vercel');
  console.log('4. Deploy!');
}