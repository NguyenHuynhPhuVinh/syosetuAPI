#!/usr/bin/env node

// Build script for Vercel deployment
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔨 Starting Vercel build process...');
console.log('📁 Current working directory:', process.cwd());
console.log('📋 Files in current directory:');
fs.readdirSync('.').forEach(file => {
  console.log(`   - ${file}`);
});

try {
  // Clean dist directory
  console.log('🧹 Cleaning dist directory...');
  if (fs.existsSync('dist')) {
    fs.rmSync('dist', { recursive: true, force: true });
  }

  // Run TypeScript compilation
  console.log('📦 Compiling TypeScript...');

  // Check if tsconfig.json exists
  const tsconfigPath = path.join(process.cwd(), 'tsconfig.json');
  if (!fs.existsSync(tsconfigPath)) {
    throw new Error(`tsconfig.json not found at ${tsconfigPath}`);
  }

  console.log(`📄 Using tsconfig at: ${tsconfigPath}`);
  execSync(`npx tsc --project "${tsconfigPath}"`, {
    stdio: 'inherit',
    cwd: process.cwd(),
  });

  // Check if dist directory was created
  if (!fs.existsSync('dist')) {
    throw new Error(
      'TypeScript compilation failed - dist directory not created'
    );
  }

  // Check if main files exist
  const requiredFiles = ['dist/app.js', 'dist/server.js'];
  for (const file of requiredFiles) {
    if (!fs.existsSync(file)) {
      throw new Error(`Required file ${file} not found after compilation`);
    }
  }

  console.log('✅ Build completed successfully!');
  console.log('📁 Generated files:');

  // List generated files
  const distFiles = fs.readdirSync('dist', { recursive: true });
  distFiles.forEach(file => {
    console.log(`   - dist/${file}`);
  });
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}
