#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('\x1b[36m%s\x1b[0m', '🧹 Clearing all caches and restarting...');

try {
  // Clear .next directory
  const nextDir = path.join(process.cwd(), '.next');
  if (fs.existsSync(nextDir)) {
    console.log('\x1b[33m%s\x1b[0m', '🗑️  Removing .next directory...');
    execSync('rm -rf .next', { stdio: 'inherit' });
    console.log('\x1b[32m%s\x1b[0m', '✅ .next directory removed');
  }

  // Clear node_modules/.cache if it exists
  const cacheDir = path.join(process.cwd(), 'node_modules', '.cache');
  if (fs.existsSync(cacheDir)) {
    console.log('\x1b[33m%s\x1b[0m', '🗑️  Clearing node_modules cache...');
    execSync('rm -rf node_modules/.cache', { stdio: 'inherit' });
    console.log('\x1b[32m%s\x1b[0m', '✅ Node modules cache cleared');
  }

  // Clear yarn cache
  console.log('\x1b[33m%s\x1b[0m', '🗑️  Clearing yarn cache...');
  execSync('yarn cache clean', { stdio: 'inherit' });
  console.log('\x1b[32m%s\x1b[0m', '✅ Yarn cache cleared');

  // Reinstall dependencies
  console.log('\x1b[33m%s\x1b[0m', '📦 Reinstalling dependencies...');
  execSync('yarn install', { stdio: 'inherit' });
  console.log('\x1b[32m%s\x1b[0m', '✅ Dependencies reinstalled');

  // Start development server
  console.log('\x1b[36m%s\x1b[0m', '🚀 Starting development server...');
  execSync('yarn dev', { stdio: 'inherit' });

} catch (error) {
  console.error('\x1b[31m%s\x1b[0m', '❌ Error:', error.message);
  process.exit(1);
} 